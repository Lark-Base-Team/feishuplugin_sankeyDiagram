import json
import pandas as pd
from baseopensdk import BaseClient, JSON
from baseopensdk.api.base.v1 import *
from dotenv import load_dotenv, find_dotenv
import os
import plotly.graph_objects as go
from pprint import pprint


load_dotenv(find_dotenv())
APP_TOKEN = os.environ['APP_TOKEN']
PERSONAL_BASE_TOKEN = os.environ['PERSONAL_BASE_TOKEN']
TABLE_ID = os.environ['TABLE_ID']


def get_df_appTabelRecord():
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
    d = [i['fields'] for i in json.loads(s)['items']]
    df = pd.DataFrame.from_records(d)
    return df



def get_fieldNames():
    client: BaseClient = BaseClient.builder() \
        .app_token(APP_TOKEN) \
        .personal_base_token(PERSONAL_BASE_TOKEN) \
        .build()
    
    request = ListAppTableFieldRequest.builder() \
        .page_size(100) \
        .table_id(TABLE_ID) \
        .build()
    
    response = client.base.v1.app_table_field.list(request)

    s = JSON.marshal(response.data)
    d = [i['field_name'] for i in json.loads(s)['items']]
    return d

# appTableFormField
# appTabel
def get_appTabel():
    client: BaseClient = BaseClient.builder() \
        .app_token(APP_TOKEN) \
        .personal_base_token(PERSONAL_BASE_TOKEN) \
        .build()
    
    request = ListAppTableRequest.builder()\
        .page_size(200)\
        .build()
    
    response = client.base.v1.app_table.list(request)

    s = JSON.marshal(response.data)
    pprint(s)
    return s


def createField(fieldname, type=1):
    client: BaseClient = BaseClient.builder() \
        .app_token(APP_TOKEN) \
        .personal_base_token(PERSONAL_BASE_TOKEN) \
        .build()
    
    request = CreateAppTableFieldRequest.builder()\
        .table_id(TABLE_ID)\
        .request_body(
            AppTableField.builder()\
                .field_name(fieldname)\
                .type(type)\
                .build()
        )\
        .build()

    response = client.base.v1.app_table_field.create(request)

    if not response.success():
        print(f"client.bitable.v1.app_table_field.create failed, code: {response.code}, msg: {response.msg}, log_id: {response.get_log_id()}")
    s = JSON.marshal(response.data)
    return s


def writejson(dic):
    client: BaseClient = BaseClient.builder() \
        .app_token(APP_TOKEN) \
        .personal_base_token(PERSONAL_BASE_TOKEN) \
        .build()
    
    request = BatchCreateAppTableRecordRequest.builder()\
        .table_id(TABLE_ID)\
        .request_body(
            BatchCreateAppTableRecordRequestBody.builder()\
                .records([
                    AppTableRecord.builder()\
                        .fields(dic)\
                        .build()
                ])\
                .build()
        )\
        .build()
    
    response = client.base.v1.app_table_record.batch_create(request)

    if not response.success():
        print(f"client.bitable.v1.app_table_record.batch_create failed, code: {response.code}, msg: {response.msg}, log_id: {response.get_log_id()}")
    s = JSON.marshal(response.data)
    return s


def updateField(o_name='abc', o_type=1):
    client: BaseClient = BaseClient.builder() \
        .app_token(APP_TOKEN) \
        .personal_base_token(PERSONAL_BASE_TOKEN) \
        .build()
    
    request = UpdateAppTableFieldRequest.builder()\
        .table_id(TABLE_ID)\
        .request_body(
            AppTableField.builder()\
                .field_name('123')\
                .type(1)\
                .build()
        )\
        .build()
    
    response = client.base.v1.app_table_field.update(request)

    if not response.success():
        print(f"client.bitable.v1.app_table_field.update failed, code: {response.code}, msg: {response.msg}, log_id: {response.get_log_id()}")
    s = JSON.marshal(response.data)
    return s


if __name__ == '__main__':
    jsonData = '''
[
  {
    "letter": "A",
    "frequency": 0.08167
  },
  {
    "letter": "B",
    "frequency": 0.01492
  },
  {
    "letter": "C",
    "frequency": 0.02782
  },
  {
    "letter": "B",
    "frequency": 0.01492
  },
  {
    "letter": "C",
    "frequency": 0.02782
  }
]
'''
    jsonData = json.loads(jsonData)
    writejson({'frequency': '123123.12312'})
    '''
    field_set = {key for item in jsonData for key in item.keys()}
    fieldnames = get_fieldNames()
    field_set -= set(fieldnames)
    for i in field_set:
        createField(i)
    #df = get_df_appTabelRecord()
    #print(df)
    #createField('文本')
    #createRecord_batch()

    for i in jsonData:
        d = {k: str(v) for k, v in i.items()}
        print(d)
        writejson(d)  
    '''

