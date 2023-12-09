from flask import Flask, request, render_template, send_from_directory, jsonify
from flask_cors import CORS
from pprint import pprint
import json
from formSendtofront import getFormContent
import os

app = Flask(__name__)
CORS(app)
jsonFile_path = r'C:\Users\17904\Desktop\diagram_fromJSON\flask_be\file_dir\form_jsondata.json'
dist_path = r'C:\Users\17904\Desktop\diagram_fromJSON\dist'


@app.route('/jsonfiles/<path:filename>')
def get_file(filename):
    return send_from_directory(os.path.join(app.root_path, 'file_dir'), filename)


@app.route('/update_json_data', methods=['POST'])
def update_json_data():
    c = getFormContent()
    with open(jsonFile_path, 'w') as jf:
        json.dump(c, jf, indent=2)

    post_data = request.get_json()

    if not post_data or 'source_index' not in post_data or 'target_index' not in post_data or 'value_index' not in post_data:
        return jsonify({"error": "Invalid request data"}), 400

    source_index = post_data['source_index']
    target_index = post_data['target_index']
    value_index = post_data['value_index']

    with open(jsonFile_path, 'r') as jf:
        json_data = json.load(jf)

    new_json = []

    for entry in json_data:
        if source_index in entry and target_index in entry and value_index in entry:
            source_value = entry[source_index]
            target_value = entry[target_index]
            value_value = entry[value_index]

            new_entry = {
                'source': source_value,
                'target': target_value,
                'value': value_value,
                'path': f"{source_value} -> {target_value} -> {value_value}"
            }

            new_json.append(new_entry)
    
    pprint(new_json[0])
    with open(jsonFile_path, 'w') as jf:
        json.dump(new_json, jf, indent=2)
    
    return jsonify({"message": "JSON file updated successfully"})

@app.route('/')
def front_index():
    return send_from_directory(dist_path, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(dist_path, filename)


app.run(host='0.0.0.0', port=5000, debug=False)