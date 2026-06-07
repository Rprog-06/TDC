const customers =
require("../data/customer.json");

const getCustomers = (req, res) => {
  res.json(customers);
};

const getCustomerById = (req, res) => {

  const id = Number(req.params.id);

  const customer = customers.find(
    c => c.id === id
  );

  if (!customer) {
    return res.status(404).json({
      message: "Customer not found"
    });
  }

  res.json(customer);
};

module.exports = {
  getCustomers,
  getCustomerById
};