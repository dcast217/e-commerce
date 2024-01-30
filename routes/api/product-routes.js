const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// GET all products
router.get('/', (req, res) => {
  try {
    // Find all products and include associated Category and Tag data
    Product.findAll({ include: [{ model: Category}, {model: Tag}] })
      .then((products) => {
        res.status(200).json(products);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a specific product by id
router.get('/:id', (req, res) => {
  try {
    // Find a single product by its `id` and include associated Category and Tag data
    Product.findByPk(req.params.id, { include:[{ model: Category}, {model: Tag}] })
      .then((product) => {
        if (!product) {
          res.status(404).json({ message: 'Product not found' });
          return;
        }
        res.status(200).json(product);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE a new product
router.post('/', (req, res) => {
  try {
    // Create a new product
    Product.create(req.body)
      .then((product) => {
        // If there are product tags, create pairings to bulk create in the ProductTag model
        if (req.body.tagIds && req.body.tagIds.length) {
          const productTagIdArr = req.body.tagIds.map((tag_id) => {
            return {
              product_id: product.id,
              tag_id,
            };
          });
          return ProductTag.bulkCreate(productTagIdArr);
        }
        // If no product tags, just respond
        res.status(200).json(product);
      })
      .then((productTagIds) => {
        res.status(200).json(productTagIds);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE a product by id
router.put('/:id', (req, res) => {
  try {
    // Update product data
    Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
      .then((product) => {
        if (req.body.tagIds && req.body.tagIds.length) {
          ProductTag.findAll({ where: { product_id: req.params.id } }).then((productTags) => {
            // Create a filtered list of new tag_ids
            const productTagIds = productTags.map(({ tag_id }) => tag_id);
            const newProductTags = req.body.tagIds
              .filter((tag_id) => !productTagIds.includes(tag_id))
              .map((tag_id) => {
                return {
                  product_id: req.params.id,
                  tag_id,
                };
              });

            // Figure out which ones to remove
            const productTagsToRemove = productTags
              .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
              .map(({ id }) => id);

            // Run both actions
            return Promise.all([
              ProductTag.destroy({ where: { id: productTagsToRemove } }),
              ProductTag.bulkCreate(newProductTags),
            ]);
          });
        }
        return res.json(product);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE a product by id
router.delete('/:id', (req, res) => {
  try {
    // Delete one product by its `id` value
    Product.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then((product) => {
        if (!product) {
          res.status(404).json({ message: 'Product not found' });
          return;
        }
        res.status(200).json({ message: 'Product deleted successfully' });
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;