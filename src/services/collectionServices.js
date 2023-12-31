import Axios from './Axios';

let collectionServices = {
  addCollection: async (obj) => {
    const response = await Axios.post(`addCollection`, obj)
    return response
  },

  uploadImageCollection: async (id, obj) => {
    const response = await Axios.post(`uploadImageCollection/${id}`, obj)
    return response
  },

  getAllCollections: async (page = 1, size = 10) => {
    const response = await Axios.get(`getAllCollections?page=${page}&size=${size}`)
    return response
  },

  collectionSearch: async (search) => {
    const response = await Axios.get(`collectionSearch?${search.length > 0 ? `&search=${search}` : ""}`)
    return response
  },

  getMostLikedCollections: async () => {
    const response = await Axios.get(`getMostLikedCollections`)
    return response
  },

  getCollectionById: async (id) => {
    const response = await Axios.get(`getCollectionById/${id}`)
    return response
  },

  editCollection: async (id, obj) => {
    const response = await Axios.put(`updateCollection/${id}`, obj)
    return response
  },

  deleteCollection: async (id) => {
    const response = await Axios.delete(`deleteCollection/${id}`)
    return response
  },

  addToArchive: async (id) => {
    const response = await Axios.put(`archiveCollection/${id}`)
    return response
  },

  removeFromArchive: async (id) => {
    const response = await Axios.put(`disArchiveCollection/${id}`)
    return response
  },
}

export default collectionServices;