const { useState, useEffect } = React;

export function BookFilter({ filterBy, onSetFilterBy }) {
  const [filterByToEdit, setFilterByToEdit] = useState(filterBy);

  useEffect(() => {
    onSetFilterBy(filterByToEdit);
  }, [filterByToEdit]);

  function handleChange({ target }) {
    const field = target.name;
    let value = target.value;

    switch (target.type) {
      case "number":
      case "range ":
        value =+ value || ''
        break

        default: 
        break
    }
    setFilterByToEdit(prevFilter => ({...prevFilter,[field]: value}))
  }
  return (
    <section className="book-filter">
    <h2>Filter Our Books</h2>
    <form>
        <label htmlFor="title">Title: </label>
        <input 
            type="text"
            id="title"
            name="title"
            placeholder="By title"
            value={filterByToEdit.title}
            onChange={handleChange}
        />

        <label htmlFor="maxPrice">Max price: </label>
        <input 
            type="number"
            id="maxPrice"
            name="maxPrice"
            placeholder="By max price"
            value={filterByToEdit.maxPrice}
            onChange={handleChange}
        />
    </form>
</section>
  )
}
