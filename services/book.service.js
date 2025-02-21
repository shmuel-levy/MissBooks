import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const BOOK_KEY = 'bookDB'
const CACHE_STORAGE_KEY = 'googleBooksCache'

_createBooks()

export const bookService = {
    query,
    get,
    remove,
    save,
    getEmptyBook,
    getDefaultFilter,
    getFilterFromSearchParams,
    getGoogleBooks,
    addGoogleBook,
    getNextBookId,
    getPrevBookId,
    addReview,
    removeReview,
    getCategoryStats,
    getBookStats
}

function query(filterBy = {}) {
    return storageService.query(BOOK_KEY)
        .then(books => {
            if (filterBy.title) {
                const regExp = new RegExp(filterBy.title, 'i')
                books = books.filter(book => regExp.test(book.title))
            }
            if (filterBy.maxPrice) {
                const maxPrice = +filterBy.maxPrice 
                books = books.filter(book => book.listPrice.amount <= maxPrice)
            }
            return books
        })
}

function get(bookId) {
    return storageService.get(BOOK_KEY, bookId)
        .then(book => _setNextPrevBookId(book))
}

function remove(bookId) {
    return storageService.remove(BOOK_KEY, bookId)
}

function save(book) {
    if (book.id) {
        return storageService.put(BOOK_KEY, book)
    } else {
        return storageService.post(BOOK_KEY, book)
    }
}


function getBookCountByCategoryMap(books) {
    const categoryCountMap = {}
    
    books.forEach(book => {
        book.categories.forEach(category => {
            if (!categoryCountMap[category]) categoryCountMap[category] = 0
            categoryCountMap[category]++
        })
    })
    
    return categoryCountMap
}

function getCategoryStats() {
    return storageService.query(BOOK_KEY)
        .then(books => {
            const categoryCountMap = getBookCountByCategoryMap(books)
            const totalBooks = books.length
            
            const data = Object.keys(categoryCountMap).map(category => ({
                name: category,
                value: Math.round((categoryCountMap[category] / totalBooks) * 100)
            }))
            
            return data
        })
}

function getBookStats(books) {
    if (!books || !books.length) return null
    
    return {
        totalBooks: books.length,
        avgPrice: Math.round(books.reduce((acc, book) => acc + book.listPrice.amount, 0) / books.length),
        onSaleCount: books.filter(book => book.listPrice.isOnSale).length,
        avgPages: Math.round(books.reduce((acc, book) => acc + book.pageCount, 0) / books.length),
        languages: [...new Set(books.map(book => book.language))].length
    }
}

function getEmptyBook(title = '', amount = '', description = '', pageCount = '', language = 'en', authors = '') {
    return {
        title,
        authors: authors ? [authors] : [],
        description,
        pageCount,
        thumbnail: '/assets/booksImages/15.jpg',
        language,
        listPrice: {
            amount: amount || 0,
            currencyCode: "EUR",
            isOnSale: Math.random() > 0.7
        },
        reviews: []
    }
}

function getDefaultFilter() {
    return {
        title: '',
        // minPrice: '',
        maxPrice: ''
    }
}

function getFilterFromSearchParams(searchParams) {
    const defaultFilter = getDefaultFilter()
    const filterBy = {}
    
    for (const field in defaultFilter) {
        filterBy[field] = searchParams.get(field) || defaultFilter[field]
    }
    return filterBy
}

function getNextBookId(bookId) {
    return storageService.query(BOOK_KEY)
        .then(books => {
            const idx = books.findIndex(book => book.id === bookId)
            return idx < books.length - 1 ? books[idx + 1].id : books[0].id
        })
}

function getPrevBookId(bookId) {
    return storageService.query(BOOK_KEY)
        .then(books => {
            const idx = books.findIndex(book => book.id === bookId)
            return idx > 0 ? books[idx - 1].id : books[books.length - 1].id
        })
}

function addReview(bookId, review) {
    return get(bookId)
        .then(book => {
            if (!book.reviews) book.reviews = []
            review.id = utilService.makeId()
            book.reviews.unshift(review)
            return save(book)
        })
}

function removeReview(bookId, reviewId) {
    return get(bookId)
        .then(book => {
            const idx = book.reviews.findIndex(review => review.id === reviewId)
            if (idx === -1) throw new Error('Review not found')
            book.reviews.splice(idx, 1)
            return save(book)
        })
}

function getGoogleBooks(searchTerm) {
    if (!searchTerm) return Promise.resolve([])
    
    const gCache = utilService.loadFromStorage(CACHE_STORAGE_KEY) || {}
    if (gCache[searchTerm]) {
        console.log('Getting from cache')
        return Promise.resolve(gCache[searchTerm])
    }

    console.log('Getting from network')
    const url = `https://www.googleapis.com/books/v1/volumes?printType=books&fields=items(id,volumeInfo)&q=${searchTerm}`
    
    return axios.get(url)
        .then(res => {
            const books = res.data.items ? _formatGoogleBooks(res.data.items) : []
            gCache[searchTerm] = books
            utilService.saveToStorage(CACHE_STORAGE_KEY, gCache)
            return books
        })
        .catch(err => {
            console.error('Failed to get books from Google API:', err)
            throw err
        })
}

function addGoogleBook(googleBook) {
    const formattedBook = _formatGoogleBook(googleBook)
    return storageService.query(BOOK_KEY)
        .then(books => {
            const existingBook = books.find(book => book.id === formattedBook.id)
            if (existingBook) {
                throw new Error('Book already exists in collection')
            }
            return storageService.post(BOOK_KEY, formattedBook)
        })
}

function _formatGoogleBook(googleBook) {
    const volumeInfo = googleBook.volumeInfo || {}
    const imageLinks = volumeInfo.imageLinks || {}
    
    let thumbnail = imageLinks.thumbnail
    if (thumbnail) {
        thumbnail = thumbnail.replace('http://', 'https://')
        thumbnail = thumbnail.replace('&edge=curl', '')
    } else {
        thumbnail = '/assets/booksImages/1.jpg'
    }

    const publishedDate = volumeInfo.publishedDate 
        ? new Date(volumeInfo.publishedDate).getFullYear()
        : new Date().getFullYear()

    return {
        id: googleBook.id || utilService.makeId(),
        title: volumeInfo.title || 'Untitled',
        subtitle: volumeInfo.subtitle || '',
        authors: volumeInfo.authors || ['Unknown Author'],
        publishedDate,
        description: volumeInfo.description || 'No description available',
        pageCount: volumeInfo.pageCount || 100,
        categories: volumeInfo.categories || ['General'],
        thumbnail,
        language: (volumeInfo.language || 'en').toUpperCase(),
        listPrice: {
            amount: utilService.getRandomIntInclusive(80, 500),
            currencyCode: "EUR",
            isOnSale: Math.random() > 0.7
        },
        reviews: []
    }
}

function _formatGoogleBooks(items) {
    if (!items || !Array.isArray(items)) return []
    return items.map(item => _formatGoogleBook(item))
}

function _setNextPrevBookId(book) {
    return storageService.query(BOOK_KEY)
        .then((books) => {
            const bookIdx = books.findIndex((currBook) => currBook.id === book.id)
            const nextBook = books[bookIdx + 1] ? books[bookIdx + 1] : books[0]
            const prevBook = books[bookIdx - 1] ? books[bookIdx - 1] : books[books.length - 1]
            book.nextBookId = nextBook.id
            book.prevBookId = prevBook.id
            return book
        })
}

function _createBooks() {
    let books = utilService.loadFromStorage(BOOK_KEY)
    if (books && books.length) return

    books = [
        {
            "id": "OXeMG8wNskc",
            "title": "metus hendrerit",
            "subtitle": "mi est eros convallis auctor arcu dapibus himenaeos",
            "authors": ["Barbara Cartland"],
            "publishedDate": 1999,
            "description": "placerat nisi sodales suscipit tellus tincidunt mauris elit sit luctus interdum ad dictum platea vehicula conubia fermentum habitasse congue suspendisse",
            "pageCount": 713,
            "categories": ["Computers", "Hack"],
            "thumbnail": "/assets/booksImages/20.jpg",
            "language": "en",
            "listPrice": {
                "amount": 109,
                "currencyCode": "EUR",
                "isOnSale": false
            },
            "reviews": []
            },
            {
                "id": "JYOJa2NpSCq",
                "title": "morbi",
                "subtitle": "lorem euismod dictumst inceptos mi",
                "authors": [
                    "Barbara Cartland"
                ],
                "publishedDate": 1978,
                "description": "aliquam pretium lorem laoreet etiam odio cubilia iaculis placerat aliquam tempor nisl auctor",
                "pageCount": 129,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/14.jpg",
                "language": "sp",
                "listPrice": {
                    "amount": 44,
                    "currencyCode": "EUR",
                    "isOnSale": true
                }
            },
            {
                "id": "1y0Oqts35DQ",
                "title": "at viverra venenatis",
                "subtitle": "gravida libero facilisis rhoncus urna etiam",
                "authors": [
                    "Dr. Seuss"
                ],
                "publishedDate": 1999,
                "description": "lorem molestie ut euismod ad quis mi ultricies nisl cursus suspendisse dui tempor sit suscipit metus etiam euismod tortor sagittis habitant",
                "pageCount": 972,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/2.jpg",
                "language": "he",
                "listPrice": {
                    "amount": 108,
                    "currencyCode": "ILS",
                    "isOnSale": false
                }
            },
            {
                "id": "kSnfIJyikTP",
                "title": "dictum",
                "subtitle": "augue eu consectetur class curabitur conubia ligula in ullamcorper",
                "authors": [
                    "Danielle Steel"
                ],
                "publishedDate": 1978,
                "description": "interdum inceptos mauris habitant primis neque tempus lacus morbi auctor cras consectetur euismod vehicula neque netus enim vivamus augue molestie imperdiet tincidunt aliquam",
                "pageCount": 303,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/16.jpg",
                "language": "en",
                "listPrice": {
                    "amount": 30,
                    "currencyCode": "EUR",
                    "isOnSale": true
                }
            },
            {
                "id": "f4iuVmbuKCC",
                "title": "sem himenaeos aptent",
                "subtitle": "interdum per habitasse luctus purus est",
                "authors": [
                    "Dr. Seuss"
                ],
                "publishedDate": 2011,
                "description": "et vehicula faucibus amet accumsan lectus cras nulla cubilia arcu neque litora mi habitasse quis amet augue facilisis sed",
                "pageCount": 337,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/12.jpg",
                "language": "sp",
                "listPrice": {
                    "amount": 19,
                    "currencyCode": "USD",
                    "isOnSale": false
                }
            },
            {
                "id": "U2rfZO6oBZf",
                "title": "mi ante posuere",
                "subtitle": "sapien curae consectetur ultrices fringilla blandit ipsum curae faucibus",
                "authors": [
                    "Leo Tolstoy"
                ],
                "publishedDate": 1978,
                "description": "senectus habitant nam imperdiet nostra elit dapibus nisl adipiscing in",
                "pageCount": 748,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/1.jpg",
                "language": "en",
                "listPrice": {
                    "amount": 91,
                    "currencyCode": "USD",
                    "isOnSale": true
                }
            },
            {
                "id": "xI0wrXaaAcq",
                "title": "non",
                "subtitle": "leo tortor per dapibus mattis ut conubia porttitor ligula viverra",
                "authors": [
                    "Leo Tolstoy"
                ],
                "publishedDate": 2011,
                "description": "nec scelerisque id cursus platea sit ullamcorper bibendum ultrices tempus ante mi aliquet cras tortor dapibus dictum scelerisque",
                "pageCount": 65,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/14.jpg",
                "language": "he",
                "listPrice": {
                    "amount": 90,
                    "currencyCode": "USD",
                    "isOnSale": false
                }
            },
            {
                "id": "9laHCEdSpFy",
                "title": "tristique",
                "subtitle": "consectetur a eu tincidunt condimentum amet nisi",
                "authors": [
                    "Dr. Seuss"
                ],
                "publishedDate": 1999,
                "description": "magna quisque venenatis laoreet purus in semper habitant proin pellentesque sed egestas cursus faucibus nam enim id sit mi ligula risus curabitur senectus curabitur sodales fames sem",
                "pageCount": 299,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/11.jpg",
                "language": "he",
                "listPrice": {
                    "amount": 176,
                    "currencyCode": "EUR",
                    "isOnSale": false
                }
            },
            {
                "id": "nGhVwZvGCGp",
                "title": "urna ornare gravida",
                "subtitle": "sem vestibulum semper convallis pharetra tempor himenaeos ut",
                "authors": [
                    "Jin Yong"
                ],
                "publishedDate": 2011,
                "description": "porttitor nisl sodales id eu tellus venenatis laoreet auctor dictumst nulla",
                "pageCount": 803,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/10.jpg",
                "language": "sp",
                "listPrice": {
                    "amount": 116,
                    "currencyCode": "USD",
                    "isOnSale": true
                }
            },
            {
                "id": "Q8Q9Lsd03BD",
                "title": "consequat neque volutpat",
                "subtitle": "vel quis taciti fermentum feugiat ullamcorper curae praesent",
                "authors": [
                    "Dr. Seuss"
                ],
                "publishedDate": 1978,
                "description": "curabitur bibendum in dolor neque magna phasellus arcu nulla cubilia senectus maecenas ullamcorper neque accumsan facilisis dictumst ornare",
                "pageCount": 891,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/5.jpg",
                "language": "en",
                "listPrice": {
                    "amount": 145,
                    "currencyCode": "EUR",
                    "isOnSale": false
                }
            },
            {
                "id": "bd7a76kARao",
                "title": "risus",
                "subtitle": "pretium bibendum pharetra curabitur quisque dictumst",
                "authors": [
                    "Danielle Steel"
                ],
                "publishedDate": 2018,
                "description": "auctor amet nostra luctus molestie proin platea cubilia netus sed purus egestas a primis eu tristique interdum litora lorem venenatis mattis senectus",
                "pageCount": 86,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/16.jpg",
                "language": "sp",
                "listPrice": {
                    "amount": 157,
                    "currencyCode": "ILS",
                    "isOnSale": true
                }
            },
            {
                "id": "qKyG0vqeO3e",
                "title": "interdum etiam vulputate",
                "subtitle": "velit sapien eget tincidunt nunc tortor",
                "authors": [
                    "Danielle Steel"
                ],
                "publishedDate": 2018,
                "description": "aenean mauris porta netus accumsan turpis etiam vestibulum vivamus sagittis nullam nec tellus quam mattis est pellentesque nisi litora sit ad",
                "pageCount": 882,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/17.jpg",
                "language": "sp",
                "listPrice": {
                    "amount": 57,
                    "currencyCode": "USD",
                    "isOnSale": true
                }
            },
            {
                "id": "2RvT48ZNInj",
                "title": "sagittis justo",
                "subtitle": "etiam primis proin praesent placerat nisi fermentum nisi",
                "authors": [
                    "Agatha Christie"
                ],
                "publishedDate": 2011,
                "description": "nec faucibus arcu suspendisse tempus potenti lobortis aliquam quisque augue integer consectetur etiam ultrices curabitur tristique metus",
                "pageCount": 598,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/8.jpg",
                "language": "en",
                "listPrice": {
                    "amount": 167,
                    "currencyCode": "ILS",
                    "isOnSale": false
                }
            },
            {
                "id": "5z2s9pDXAYj",
                "title": "quam ullamcorper himenaeos",
                "subtitle": "ut placerat eu dapibus sapien sodales laoreet",
                "authors": [
                    "Danielle Steel"
                ],
                "publishedDate": 1999,
                "description": "etiam nec aliquam euismod platea vel laoreet quisque condimentum sapien neque ut aliquam torquent in nam",
                "pageCount": 608,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/3.jpg",
                "language": "he",
                "listPrice": {
                    "amount": 150,
                    "currencyCode": "USD",
                    "isOnSale": true
                }
            },
            {
                "id": "zBZu5cDEWha",
                "title": "quis",
                "subtitle": "suscipit turpis etiam turpis libero lobortis",
                "authors": [
                    "Jin Yong"
                ],
                "publishedDate": 2011,
                "description": "etiam pretium urna fusce lobortis curae viverra aptent metus semper nisi litora feugiat elementum purus nunc consequat lorem ultricies non primis phasellus sociosqu donec dolor",
                "pageCount": 583,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/6.jpg",
                "language": "en",
                "listPrice": {
                    "amount": 58,
                    "currencyCode": "ILS",
                    "isOnSale": true
                }
            },
            {
                "id": "aOI7tQuPZ2f",
                "title": "aliquam aliquet dapibus",
                "subtitle": "neque eu purus euismod placerat adipiscing odio egestas consequat",
                "authors": [
                    "Leo Tolstoy"
                ],
                "publishedDate": 2011,
                "description": "dolor morbi malesuada eleifend purus taciti sit interdum aliquet commodo ut libero tincidunt",
                "pageCount": 497,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/7.jpg",
                "language": "en",
                "listPrice": {
                    "amount": 78,
                    "currencyCode": "USD",
                    "isOnSale": false
                }
            },
            {
                "id": "WBooB82Uvwu",
                "title": "class",
                "subtitle": "elit enim ultricies amet imperdiet a molestie class elementum venenatis",
                "authors": [
                    "Danielle Steel"
                ],
                "publishedDate": 1999,
                "description": "rhoncus odio netus consectetur aenean hendrerit massa scelerisque elementum aptent lobortis pharetra maecenas quam nulla volutpat turpis non habitasse aenean ante sodales lobortis quisque libero imperdiet gravida eleifend nulla",
                "pageCount": 804,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/10.jpg",
                "language": "en",
                "listPrice": {
                    "amount": 118,
                    "currencyCode": "ILS",
                    "isOnSale": false
                }
            },
            {
                "id": "xm1z5bbZjlS",
                "title": "vitae",
                "subtitle": "class habitant at commodo semper ligula a bibendum",
                "authors": [
                    "Leo Tolstoy"
                ],
                "publishedDate": 1999,
                "description": "himenaeos quis iaculis orci libero egestas quam varius primis erat lacus facilisis blandit dictum tristique interdum litora quisque purus senectus pretium purus",
                "pageCount": 231,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/12.jpg",
                "language": "he",
                "listPrice": {
                    "amount": 60,
                    "currencyCode": "EUR",
                    "isOnSale": false
                }
            },
            {
                "id": "u3j6QIKLlJb",
                "title": "rhoncus vivamus",
                "subtitle": "nullam class risus amet senectus scelerisque etiam curabitur",
                "authors": [
                    "Agatha Christie"
                ],
                "publishedDate": 1978,
                "description": "torquent in et id lacus vivamus aptent cursus erat integer venenatis risus ac ante quam etiam euismod feugiat risus suscipit rhoncus pharetra quisque felis",
                "pageCount": 652,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/20.jpg",
                "language": "he",
                "listPrice": {
                    "amount": 110,
                    "currencyCode": "USD",
                    "isOnSale": true
                }
            },
            {
                "id": "vxYYYdVlEH3",
                "title": "donec mi ullamcorper",
                "subtitle": "varius malesuada augue molestie sollicitudin faucibus mi eu tempus",
                "authors": [
                    "William Shakespeare"
                ],
                "publishedDate": 2011,
                "description": "aliquet euismod mi vivamus bibendum donec etiam quisque iaculis ullamcorper est sed",
                "pageCount": 904,
                "categories": [
                    "Computers",
                    "Hack"
                ],
                "thumbnail": "http://coding-academy.org/books-photos/2.jpg",
                "language": "sp",
                "listPrice": {
                    "amount": 186,
                    "currencyCode": "ILS",
                    "isOnSale": true
                }
            }
        ]
        utilService.saveToStorage(BOOK_KEY, books)
}