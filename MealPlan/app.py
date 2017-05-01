#!/usr/bin/python

'''
user = {
    "name": "Ian Berk",
    "email": "ianberk@gmail.com",
    "guid": <unique incrementing integer>,
    "favorite_recipes": [1,2,3]
}

recipe = {
    "id": <id>,
    "name": "Chili",
    "author": "Martha Stewart"
    "creator": <guid>,
    "suggested_recipes": [<id>, <id>],
    "total_time": 60,
    "prep_time": 30,
    "cook_time": 30,
    "serves": 4,
    "notes": "They sell cans of 14oz kidney beans at Meijer's",
    "ingredients": [
        {
            "name": "Ground beef"
            "amount": 1,
            "unit": "lb"   
        },
        {
            "name": "Kidney beans",
            "amount": 24,
            "unit": "oz"
        },
        {
            "name": "Red onion",
            "amount": 0.5,
            "unit": ""
        }
    ],
    "directions": [
        "Cook meat",
        "Stir in beans",
        "Simmer on HIGH for 20min",
        "Add Onions",
        "Stir for 10min on MEDIUM heat"
    ]
}

suggestions: {
    "1": [1, 2],
    "2": [3, 5]
}
'''

import os
import json
import time

import tornado.ioloop
import tornado.web

from pymongo import MongoClient

from bson import ObjectId as ObjectId

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("static/html/index.html")

class RecipeHandler(tornado.web.RequestHandler):
    ''' gets a collection '''
    def get_collection(self, table_name):
        database   = "mealplan"
        client = MongoClient('mongodb://localhost:27017/')
        db = client[database]
        collection = db[table_name]
        return collection

    """ HTTP METHODS """
    
    """
    GET - read only, single item or a set of items
    """
    def get(self, recipe_id):

        collection = self.get_collection("recipe")
        search = {}
        if recipe_id:
            search['_id'] = ObjectId(recipe_id)

        results = collection.find(search).sort("created_time", -1)
        ret     = []
        for doc in results:
            item = doc
            item['_id'] = str(item['_id'])
            ret.append(item)
        
        self.set_header('Content-Type', 'application/json')
        self.write(json.dumps(ret))
        self.finish()

    #"""
    #POST - for creating a record or set of records 
    #"""
    def post(self, recipe_id):
        collection = self.get_collection("recipe")
        if recipe_id:
            self.set_status(400)
            return json.dumps({"status": 400, "message": "Malformed request"})
        if not self.request.body:
            self.set_status(400)
            return json.dumps({"status": 400, "message": "Empty request"})
        
        data = json.loads(self.request.body.decode())
        data['created_time'] = time.time()
        recipe_id = collection.insert_one(data).inserted_id

        self.set_header('Content-Type', 'application/json')
        self.write(json.dumps({"status": 200, "message": "success", "id": str(recipe_id)}))
        self.finish()

    def put(self):
        # @todo
        self.finish()

    def delete(self, recipe_id):
        collection = self.get_collection("recipe")
        collection.remove({
            "_id": ObjectId(recipe_id)
        })
        self.set_header('Content-Type', 'application/json')
        self.write(json.dumps({"status": 200, "message": "success", "id": str(recipe_id)}))
        self.finish()

def make_app():
    settings = {
        "static_path": os.path.join(os.path.dirname(__file__), "static")
    }

    return tornado.web.Application([ 
        (r"/", MainHandler),
        (r"/api/recipe/?(?P<recipe_id>[0-9a-f].*)?", RecipeHandler)
    ], autoreload=True,
    **settings)

if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    tornado.ioloop.IOLoop.current().start()