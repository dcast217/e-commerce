const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// GET all tags
router.get('/', (req, res) => {
  try {
    // Find all tags and include associated Product data
    Tag.findAll({ include: Product })
      .then((tags) => {
        res.status(200).json(tags);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a specific tag by id
router.get('/:id', (req, res) => {
  try {
    // Find a single tag by its `id` and include associated Product data
    Tag.findByPk(req.params.id, { include: Product })
      .then((tag) => {
        if (!tag) {
          res.status(404).json({ message: 'Tag not found' });
          return;
        }
        res.status(200).json(tag);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE a new tag
router.post('/', (req, res) => {
  try {
    // Create a new tag
    Tag.create(req.body)
      .then((tag) => {
        res.status(201).json(tag);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE a tag's name by id
router.put('/:id', (req, res) => {
  try {
    // Update a tag's name by its `id` value
    Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
      .then((tag) => {
        if (tag[0] === 0) {
          res.status(404).json({ message: 'Tag not found' });
          return;
        }
        res.status(200).json({ message: 'Tag updated successfully' });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE a tag by id
router.delete('/:id', (req, res) => {
  try {
    // Delete one tag by its `id` value
    Tag.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then((tag) => {
        if (!tag) {
          res.status(404).json({ message: 'Tag not found' });
          return;
        }
        res.status(200).json({ message: 'Tag deleted successfully' });
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;