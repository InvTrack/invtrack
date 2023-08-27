import random
import math

for inventory_id in range(10):
    for product_id in range(4):
        num = random.random() * 100
        if product_id == 0:
            num = math.floor(num)
        print("(" + str(inventory_id + 1) + ", " + str(product_id + 1) + ", " + str(num)[:4] + "),")