import pandas as pd
import matplotlib.pyplot as plt

# Load the data
df = pd.read_csv("data/reactive-gases.csv")

# Clean the data
df = df.dropna()

# Pivot the dataframe to have scenarios as columns and years as rows
df_pivot = df.pivot_table(index='Scenario', columns='Gas/Region')

# Plot the data
plt.figure(figsize=(10, 6))
for column in df_pivot.columns:
    plt.plot(df_pivot.index, df_pivot[column], label=column)

plt.title('Reactive Gases Over Time')
plt.xlabel('Year')
plt.ylabel('Quantity')
plt.legend()
plt.show()