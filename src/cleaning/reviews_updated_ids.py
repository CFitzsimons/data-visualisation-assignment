import pandas as pd
df = pd.DataFrame()
header = True
for df in pd.read_csv('./data/reviews.csv', chunksize=1000):
  df = df[(df['voted_up'] != 1)]
  df.drop(df.columns.difference(['recommendationid', 'voted_up']), inplace=True, axis=1)
  df.to_csv('output/updated-ids.csv', header=header, mode='a')
  header = False
  
