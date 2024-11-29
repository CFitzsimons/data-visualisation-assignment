import pandas as pd
df = pd.DataFrame()
header = True
for df in pd.read_csv('./data/reviews.csv', chunksize=1000):
  df = df[(df['written_during_early_access'] == 1)]
  df.drop(df.columns.difference(['recommendationid', 'written_during_early_access']), inplace=True, axis=1)
  if (len(df) > 0):
    df.to_csv('output/updated-ea-ids.csv', header=header, mode='a')
    header = False
  
