import firebase_admin
from firebase_admin import credentials, firestore
import json
from typing import Dict, Any, List, Set


class FirestoreStructureAnalyzer:
    def __init__(self, credentials_path: str = None):
        """
        Initialize Firestore connection

        Args:
            credentials_path: Path to service account key JSON file
                            If None, uses default credentials
        """
        if not firebase_admin._apps:
            if credentials_path:
                cred = credentials.Certificate(credentials_path)
                firebase_admin.initialize_app(cred)
            else:
                firebase_admin.initialize_app()

        self.db = firestore.client()

    def get_field_type(self, value: Any) -> str:
        """Get the type of a field value"""
        if isinstance(value, bool):
            return 'boolean'
        elif isinstance(value, int):
            return 'integer'
        elif isinstance(value, float):
            return 'float'
        elif isinstance(value, str):
            return 'string'
        elif isinstance(value, list):
            if len(value) > 0:
                element_types = set()
                for item in value[:5]:  # Check first 5 elements
                    element_types.add(self.get_field_type(item))
                if len(element_types) == 1:
                    return f'array<{list(element_types)[0]}>'
                else:
                    return f'array<mixed: {", ".join(element_types)}>'
            return 'array<empty>'
        elif isinstance(value, dict):
            return 'map'
        elif hasattr(value, 'timestamp'):  # Firestore timestamp
            return 'timestamp'
        elif value is None:
            return 'null'
        else:
            return str(type(value).__name__)

    def analyze_document_fields(self, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze document fields recursively"""
        field_structure = {}

        for field_name, field_value in doc_data.items():
            field_type = self.get_field_type(field_value)

            field_info = {
                'type': field_type,
                'sample_value': None
            }

            # Handle different field types
            if isinstance(field_value, dict):
                # Nested object/map
                field_info['nested_fields'] = self.analyze_document_fields(field_value)
                field_info['sample_value'] = f"<map with {len(field_value)} fields>"
            elif isinstance(field_value, list):
                # Array
                field_info['array_length'] = len(field_value)
                if len(field_value) > 0:
                    if isinstance(field_value[0], dict):
                        # Array of objects
                        field_info['array_element_structure'] = self.analyze_document_fields(field_value[0])
                        field_info['sample_value'] = f"<array of maps, length: {len(field_value)}>"
                    else:
                        # Array of primitives
                        field_info['sample_value'] = field_value[:3] if len(field_value) <= 3 else field_value[:3] + [
                            '...']
                else:
                    field_info['sample_value'] = []
            else:
                # Primitive type
                if isinstance(field_value, str) and len(field_value) > 100:
                    field_info['sample_value'] = field_value[:100] + "..."
                else:
                    field_info['sample_value'] = field_value

            field_structure[field_name] = field_info

        return field_structure

    def get_subcollections(self, doc_ref) -> List[str]:
        """Get list of subcollection names for a document"""
        try:
            subcollections = doc_ref.collections()
            return [subcol.id for subcol in subcollections]
        except Exception as e:
            print(f"Error getting subcollections: {str(e)}")
            return []

    def analyze_subcollection(self, collection_ref, max_docs: int = 10) -> Dict[str, Any]:
        """Analyze structure of a subcollection"""
        try:
            docs = list(collection_ref.limit(max_docs).stream())

            if not docs:
                return {
                    'document_count': 0,
                    'structure': 'empty_collection'
                }

            # Analyze ALL documents to get complete field coverage
            all_fields = {}
            sample_documents = []

            for i, doc in enumerate(docs):
                doc_data = doc.to_dict()
                doc_structure = self.analyze_document_fields(doc_data)

                # Store sample documents (first 3)
                if i < 3:
                    sample_documents.append({
                        'document_id': doc.id,
                        'fields': list(doc_structure.keys()),
                        'sample_data': {k: v.get('sample_value') for k, v in doc_structure.items()}
                    })

                # Merge all field structures
                for field_name, field_info in doc_structure.items():
                    if field_name not in all_fields:
                        all_fields[field_name] = field_info
                    else:
                        # If field exists, check for type variations
                        existing_type = all_fields[field_name]['type']
                        new_type = field_info['type']
                        if existing_type != new_type:
                            # Handle type variations
                            if 'type_variations' not in all_fields[field_name]:
                                all_fields[field_name]['type_variations'] = [existing_type]
                            if new_type not in all_fields[field_name]['type_variations']:
                                all_fields[field_name]['type_variations'].append(new_type)

            # Check subcollections from first document
            first_doc = docs[0]
            subcollections = self.get_subcollections(first_doc.reference)
            subcol_structures = {}

            for subcol_name in subcollections:
                print(f"    Analyzing nested subcollection: {subcol_name}")
                subcol_ref = first_doc.reference.collection(subcol_name)
                subcol_structures[subcol_name] = self.analyze_subcollection(subcol_ref, max_docs=5)

            collection_info = {
                'total_documents_analyzed': len(docs),
                'document_structure': all_fields,
                'sample_documents': sample_documents,
                'field_summary': {
                    'total_unique_fields': len(all_fields),
                    'field_names': list(all_fields.keys())
                }
            }

            if subcol_structures:
                collection_info['subcollections'] = subcol_structures

            return collection_info

        except Exception as e:
            return {
                'error': str(e),
                'document_count': 0
            }

    def analyze_document_structure(self, collection_name: str, document_id: str) -> Dict[str, Any]:
        """
        Analyze complete structure of a specific document including all subcollections

        Args:
            collection_name: Name of the collection (e.g., 'vendor_store')
            document_id: ID of the specific document to analyze

        Returns:
            Complete structure analysis as JSON
        """
        print(f"Analyzing document structure: {collection_name}/{document_id}")
        print("=" * 60)

        try:
            # Get the main document
            doc_ref = self.db.collection(collection_name).document(document_id)
            doc = doc_ref.get()

            if not doc.exists:
                return {
                    'error': f'Document {document_id} not found in collection {collection_name}',
                    'collection': collection_name,
                    'document_id': document_id
                }

            # Analyze main document structure
            doc_data = doc.to_dict()
            main_structure = self.analyze_document_fields(doc_data)

            # Get subcollections
            subcollections = self.get_subcollections(doc_ref)
            subcol_structures = {}

            print(f"Found {len(subcollections)} subcollections: {subcollections}")

            # Analyze each subcollection
            for subcol_name in subcollections:
                print(f"Analyzing subcollection: {subcol_name}")
                subcol_ref = doc_ref.collection(subcol_name)
                subcol_structures[subcol_name] = self.analyze_subcollection(subcol_ref)

            # Build complete structure
            complete_structure = {
                'collection_name': collection_name,
                'document_id': document_id,
                'document_exists': True,
                'main_document': {
                    'field_count': len(main_structure),
                    'structure': main_structure
                },
                'subcollections_count': len(subcollections),
                'subcollections': subcol_structures,
                'analysis_summary': {
                    'total_subcollections': len(subcollections),
                    'main_document_fields': len(main_structure),
                    'subcollection_names': subcollections
                }
            }

            return complete_structure

        except Exception as e:
            return {
                'error': str(e),
                'collection': collection_name,
                'document_id': document_id
            }

    def export_structure(self, structure_data: Dict[str, Any], filename: str = None):
        """Export structure to JSON file"""
        if filename is None:
            doc_id = structure_data.get('document_id', 'unknown')
            filename = f"firestore_structure_{doc_id}.json"

        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(structure_data, f, indent=2, default=str, ensure_ascii=False)
            print(f"\nStructure exported to: {filename}")
            return filename
        except Exception as e:
            print(f"Error exporting structure: {str(e)}")
            return None

    def print_structure_summary(self, structure_data: Dict[str, Any]):
        """Print a readable summary of the structure"""
        if 'error' in structure_data:
            print(f"Error: {structure_data['error']}")
            return

        print(f"\nStructure Summary for: {structure_data['collection_name']}/{structure_data['document_id']}")
        print("=" * 80)

        # Main document summary
        main_doc = structure_data['main_document']
        print(f"Main Document Fields: {main_doc['field_count']}")
        print("-" * 40)

        for field_name, field_info in main_doc['structure'].items():
            print(f"  • {field_name}: {field_info['type']}")
            if field_info.get('sample_value'):
                sample = str(field_info['sample_value'])
                if len(sample) > 50:
                    sample = sample[:50] + "..."
                print(f"    Sample: {sample}")

            if 'nested_fields' in field_info:
                nested_fields = field_info['nested_fields']
                print(f"    └─ Nested fields ({len(nested_fields)}):")
                for nested_field, nested_info in nested_fields.items():
                    print(f"       • {nested_field}: {nested_info['type']}")

        # Subcollections summary
        subcols = structure_data['subcollections']
        print(f"\nSubcollections: {len(subcols)}")
        print("=" * 40)

        for subcol_name, subcol_info in subcols.items():
            doc_count = subcol_info.get('total_documents_analyzed', subcol_info.get('document_count', 0))
            print(f"\n📁 {subcol_name}: {doc_count} documents analyzed")

            if 'document_structure' in subcol_info:
                doc_structure = subcol_info['document_structure']
                print(f"   Fields found: {len(doc_structure)}")

                for field_name, field_info in doc_structure.items():
                    type_info = field_info['type']
                    if 'type_variations' in field_info:
                        type_info += f" (variations: {', '.join(field_info['type_variations'])})"
                    print(f"   • {field_name}: {type_info}")

                    if field_info.get('sample_value'):
                        sample = str(field_info['sample_value'])
                        if len(sample) > 60:
                            sample = sample[:60] + "..."
                        print(f"     Sample: {sample}")

                    if 'nested_fields' in field_info:
                        nested_fields = field_info['nested_fields']
                        print(f"     └─ Nested fields ({len(nested_fields)}):")
                        for nested_field, nested_info in nested_fields.items():
                            print(f"        • {nested_field}: {nested_info['type']}")

            # Show sample documents
            if 'sample_documents' in subcol_info:
                print(f"   Sample document IDs: {[doc['document_id'] for doc in subcol_info['sample_documents']]}")

            # Show nested subcollections
            if 'subcollections' in subcol_info:
                nested_subcols = list(subcol_info['subcollections'].keys())
                print(f"   └─ Nested subcollections: {nested_subcols}")

                # Show details of nested subcollections
                for nested_subcol_name, nested_subcol_info in subcol_info['subcollections'].items():
                    nested_doc_count = nested_subcol_info.get('total_documents_analyzed',
                                                              nested_subcol_info.get('document_count', 0))
                    print(f"      📁 {nested_subcol_name}: {nested_doc_count} documents")

                    if 'document_structure' in nested_subcol_info:
                        nested_fields = list(nested_subcol_info['document_structure'].keys())
                        print(f"         Fields: {nested_fields}")

        print("\n" + "=" * 80)


def main():
    """Main function"""
    # Configuration
    COLLECTION_NAME = "vendor_store"
    DOCUMENT_ID = input("Enter the document ID to analyze: ").strip()

    if not DOCUMENT_ID:
        print("Please provide a valid document ID")
        return

    # Initialize analyzer
    # Option 1: Use service account key
    analyzer = FirestoreStructureAnalyzer("backend/serviceAccountKey.json")

    # Option 2: Use default credentials
    # analyzer = FirestoreStructureAnalyzer()

    print(f"Starting deep analysis of document: {DOCUMENT_ID}")
    print("This will analyze ALL documents in subcollections to capture complete field structure...")
    print("-" * 60)

    # Analyze document structure
    structure = analyzer.analyze_document_structure(COLLECTION_NAME, DOCUMENT_ID)

    # Print detailed summary
    analyzer.print_structure_summary(structure)

    # Export to JSON
    filename = analyzer.export_structure(structure)

    print(f"\n📄 Complete structure analysis saved to: {filename}")

    # Show specific products information if available
    if 'subcollections' in structure:
        for subcol_name, subcol_info in structure['subcollections'].items():
            if 'products' in subcol_name.lower() or subcol_name == 'products':
                print(f"\n🛍️  PRODUCTS COLLECTION DETAILS:")
                if 'document_structure' in subcol_info:
                    product_fields = subcol_info['document_structure']
                    print(f"   Total product fields found: {len(product_fields)}")
                    for field_name, field_info in product_fields.items():
                        print(f"   • {field_name}: {field_info['type']}")
                        if field_info.get('sample_value'):
                            print(f"     Example: {field_info['sample_value']}")

    print(f"\n📋 Analysis Complete! Check {filename} for full JSON structure.")

    # Ask if user wants to see raw JSON preview
    show_json = input("\nWould you like to see a preview of the JSON structure? (y/n): ").strip().lower()
    if show_json == 'y':
        print("\n" + "=" * 60)
        print("JSON STRUCTURE PREVIEW:")
        print("=" * 60)
        print(json.dumps(structure, indent=2, default=str))


if __name__ == "__main__":
    main()