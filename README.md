# Data Visualisation Assignment

## Setup

Ensure you grab the two required data sets.  They're both pretty large so make sure your device has enough memory to extract the CSV files.  

- [Review Dataset](https://www.kaggle.com/datasets/kieranpoc/steam-reviews)
- [Games Dataset](https://www.kaggle.com/datasets/fronkongames/steam-games-dataset)

Once extracted, ensure both CSV files are copied ot the `data` directory, the folder structure should look as follows:

```
/data
  games.json
  reviews.csv
```

Secondly, ensure your database connection is configured.  This is done by populating the `.env` file with the connection settings.  There's an example `.env` that can be copied and populated.

## Structure

There are python scripts that will process the CSV files to get them ready to be sent to the DB.  The TypeScript scripts will create the DB structure and take the processed data, writing it to the DB.  


