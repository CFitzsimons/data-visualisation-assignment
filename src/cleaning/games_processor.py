import json
import pandas as pd

df = pd.read_json('../../data/games.json', orient='index')
df = df.reset_index()
df.rename(columns={'index': 'AppID'}, inplace=True)

# df = pd.read_csv('data/games.csv', index_col=False)

def process_comma_string(comma_str, set):
  if type(comma_str) is not str:
    return
  for item in comma_str.split(','):
    if item != "":
      set.add(item)

def process_csv_series(series: pd.Series):
  series.dropna(inplace=True)
  series_set = set()
  for item in series:
    process_comma_string(item, series_set)
  return series_set

def list_to_json(title, names):
  with open(f"output/{title}.json", "w") as outfile:
    json.dump(list(names), outfile)
def clean_and_process_series(series):
  uniques = df.genres.apply(tuple).explode().unique()
  return [{ "name": item } for item in uniques if type(item) is str]


genres = clean_and_process_series(df.genres)
tags = clean_and_process_series(df.tags)
categories = clean_and_process_series(df.categories)

list_to_json('genres', genres)
list_to_json('tags', tags)
list_to_json('categories', categories)

df.drop(df.columns.difference(['AppID', 'name']), inplace=True, axis=1)
df.rename(columns={'AppID': 'id'}, inplace=True)
loaded_json = json.loads(df.to_json(orient='records'))
with open(f"output/games.json", "w") as outfile:
  json.dump(loaded_json, outfile, ensure_ascii=False)