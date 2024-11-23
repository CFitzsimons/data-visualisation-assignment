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


genres = process_csv_series(df.Genres)
tags = process_csv_series(df.Tags)
categories = process_csv_series(df.Categories)

# print(genres)
# print(tags)

print(categories)