import json
from baseopensdk import BaseClient, JSON
from baseopensdk.api.base.v1 import *
from dotenv import load_dotenv, find_dotenv
import os
from pprint import pprint


load_dotenv(find_dotenv())
APP_TOKEN = os.environ['APP_TOKEN']
PERSONAL_BASE_TOKEN = os.environ['PERSONAL_BASE_TOKEN']
TABLE_ID = os.environ['TABLE_ID']


def convert_to_float(value):
    try:
        return float(value)
    except (ValueError, TypeError):
        return value

def convert_dict_values_to_float(data):
    for key, value in data.items():
        if isinstance(value, dict):
            convert_dict_values_to_float(value)
        elif isinstance(value, list):
            for i, item in enumerate(value):
                value[i] = convert_to_float(item)
        else:
            data[key] = convert_to_float(value)


def getFormContent():
    client: BaseClient = BaseClient.builder() \
        .app_token(APP_TOKEN) \
        .personal_base_token(PERSONAL_BASE_TOKEN) \
        .build()
    
    request = ListAppTableRecordRequest.builder() \
        .table_id(TABLE_ID) \
        .page_size(200) \
        .build()
    
    response = client.base.v1.app_table_record.list(request)

    s = JSON.marshal(response.data)
    # all json content will be str when request
    jsonData = []
    for i in json.loads(s)['items']:
        fields = i['fields']
        convert_dict_values_to_float(fields)
        jsonData.append(fields)
    #pprint(jsonData)
    return jsonData


if __name__ == '__main__':
    getFormContent()
    print()