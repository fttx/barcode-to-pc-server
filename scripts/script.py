import json
import os
import argparse

def split_json_file(input_file, output_dir, max_rows=50):
    """
    Split a large JSON file into multiple smaller files, each containing a maximum number of rows.

    :param input_file: Path to the input JSON file.
    :param output_dir: Directory where the output files will be saved.
    :param max_rows: Maximum number of rows per output file.
    """
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Read the input JSON file
    with open(input_file, 'r') as f:
        data = json.load(f)

    # Determine if the data is a dictionary or a list
    if isinstance(data, dict):
        data_items = list(data.items())
    elif isinstance(data, list):
        data_items = data
    else:
        raise ValueError("Unsupported JSON format")

    # Split the data into chunks
    for i in range(0, len(data_items), max_rows):
        chunk = data_items[i:i + max_rows]
        if isinstance(data, dict):
            chunk = dict(chunk)
        output_file = os.path.join(output_dir, f'output_{i//max_rows + 1}.json')

        # Write the chunk to a new JSON file
        with open(output_file, 'w') as f:
            json.dump(chunk, f, indent=4)

    print(f"Split {input_file} into {len(data_items)//max_rows + 1} files in {output_dir}")

def main():
    parser = argparse.ArgumentParser(description="Perform actions on JSON files.")
    parser.add_argument('action', type=str, choices=['split'], help='Action to perform on the JSON file.')
    parser.add_argument('input_file', type=str, help='Path to the input JSON file.')
    parser.add_argument('output_dir', type=str, help='Directory where the output files will be saved.')
    parser.add_argument('--max_rows', type=int, default=50, help='Maximum number of rows per output file (default: 50).')

    args = parser.parse_args()

    if args.action == 'split':
        split_json_file(args.input_file, args.output_dir, args.max_rows)
    else:
        print(f"Action '{args.action}' is not supported.")

if __name__ == "__main__":
    main()
