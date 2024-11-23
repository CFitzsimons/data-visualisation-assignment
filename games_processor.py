import json
import pandas as pd

df = pd.read_csv('data/games.csv')

df.head()

df.info()

def process_comma_string(comma_str, set):
  if type(comma_str) is not str:
    return
  for item in comma_str.split(','):
    set.add(item)

def process_csv_series(series):
  series_set = set()
  for item in series:
    process_comma_string(item, series_set)
  return series_set

def list_to_json(title, names):
  with open(f"output/{title}.json", "w") as outfile:
    json.dump(list(names), outfile)


genres = [{ "name": item } for item in process_csv_series(df.Genres)]
tags = [{ "name": item } for item in process_csv_series(df.Tags)]
categories = [{ "name": item } for item in process_csv_series(df.Categories)]

list_to_json('genres', genres)
list_to_json('tags', tags)
list_to_json('categories', categories)