const home = async (req, res) => {
  res.status(200).json({ name: 'web apis', home: 'home' })
}

module.exports = {
  home
}
