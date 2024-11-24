import pandas as pd
df = pd.DataFrame()
header = True
for df in pd.read_csv('./data/reviews.csv', chunksize=1000):
  print('Next chunk')
  # Dates
  df.timestamp_created = pd.to_datetime(df.timestamp_created, unit='s')
  df.timestamp_updated = pd.to_datetime(df.timestamp_updated, unit='s')

  # Language
  df.drop(df[(df.language != 'english')].index, inplace=True)

  ## Empty Reviews
  df.drop(df[(df.review == "")].index, inplace=True)
  df.to_csv('output/clean-reviews.csv', header=header, mode='a')
  header = False
  
