import express from 'express';
import { items, inventories } from './data';

const app = express();
app.use(express.json());
const PORT = 5000;
app.get('/',(req,res,next) => {
    res.status(200).json({
        'message': 'Running Node with Express and Typescript'
    });
});
app.get('/item/:itemId',(req,res,next) => {
    const found = items.find((item) => item.id === req.params.itemId);
    if (!found) {
        return res.status(404).send({message: `Item ${req.params.itemId} not found`}); 
    };
    res.status(200).json(found);
});
app.get('/inventory/:inventoryId',(req,res,next) => {
    const found = inventories.find((inv) => inv.id === req.params.inventoryId);
    if (!found) {
        return res.status(404).send({message: `Inventory ${req.params.inventoryId} not found`}); 
    };
    res.status(200).json(found);
});
app.post('/inventory/',(req,res,next) => {
    console.log(req.body);
    res.send("Inventory created");
});
app.listen(PORT, () => {
    console.log( `Server running on ${PORT}.`);
});
