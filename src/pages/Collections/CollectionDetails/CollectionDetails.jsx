import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import collectionServices from '../../../services/collectionServices'
import toastPopup from '../../../helpers/toastPopup'
import OverlayLoading from '../../../components/OverlayLoading/OverlayLoading'
import imageEndPoint from '../../../services/imagesEndPoint'
import Pagination from 'react-js-pagination'
import './CollectionDetails.scss'

export default function CollectionDetails() {

  const params = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [collection, setCollection] = useState({})
  const [categories, setCategories] = useState([])
  const [errorMessage, setErrorMessage] = useState("");
  const [modalShow, setModalShow] = useState(false)
  const [collectionItems, setCollectionItems] = useState([])
  const [totalResult, setTotalResult] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [Collections, setCollections] = useState([])

  function handlePageChange(pageNumber = 1) {
    setCurrentPage(pageNumber)
    navigate(`/collections/${Collections[pageNumber - 1]?._id}`)
    getCollectionByIdHandler(Collections[pageNumber - 1]?._id)
  }

  async function getCollectionByIdHandler(id = params?.id) {
    setLoading(true)
    try {
      const { data } = await collectionServices.getCollectionById(id);
      setLoading(true)
      if (data?.success && data?.status === 200) {
        setLoading(false);
        setCollection(data?.Data)
        setCategories(data?.Data?.categoryList)
        setCollectionItems(data?.Data?.itemsList)
      }
    } catch (e) {
      setLoading(false);
      setErrorMessage(e?.response?.data?.message);
    }
  }

  async function getAllCollectionsHandler() {
    setLoading(true)
    try {
      const { data } = await collectionServices.getAllCollections(1, 5000);
      setLoading(true)
      if (data?.success && data?.status === 200) {
        setLoading(false);
        setCollections(data?.Data)
        setTotalResult(data?.totalResult)
        setCurrentPage(data?.Data?.findIndex(obj => obj?._id === params?.id) + 1)
      }
    } catch (e) {
      setLoading(false);
      setErrorMessage(e?.response?.data?.message);
    }
  }

  async function deleteCollectionHandler() {
    let nextCollection = Collections[currentPage]?._id;
    let firstCollection = Collections[0]?._id;
    setLoading(true)
    try {
      const { data } = await collectionServices.deleteCollection(params?.id)
      setLoading(true)
      if (data?.success && data?.status === 200) {
        setModalShow(false)
        setLoading(false);
        if (Collections?.length === 1) {
          navigate(`/collections`)
        } else if (currentPage === Collections?.length) {
          navigate(`/collections/${firstCollection}`)
          getCollectionByIdHandler(firstCollection)
          getAllCollectionsHandler()
        } else {
          navigate(`/collections/${nextCollection}`)
          getCollectionByIdHandler(nextCollection)
          getAllCollectionsHandler()
        }
        toastPopup.success("Collection deleted successfully")
      }
    } catch (e) {
      setLoading(false);
      setErrorMessage(e?.response?.data?.message);
    }
  }

  async function addToArchiveHandler() {
    setArchiveLoading(true)
    try {
      const { data } = await collectionServices.addToArchive(params?.id)
      setArchiveLoading(false);
      getCollectionByIdHandler()
      toastPopup.success("Collection added to archive successfully")
    } catch (e) {
      setLoading(false);
      setErrorMessage(e?.response?.data?.message);
    }
  }

  async function removeFromArchiveHandler() {
    setArchiveLoading(true)
    try {
      const { data } = await collectionServices.removeFromArchive(params?.id)
      setArchiveLoading(false);
      getCollectionByIdHandler()
      toastPopup.success("Collection removed from archive successfully")
    } catch (e) {
      setLoading(false);
      setErrorMessage(e?.response?.data?.message);
    }
  }

  useEffect(() => {
    getCollectionByIdHandler()
    getAllCollectionsHandler()
  }, [])

  return <>
    {modalShow && <div className="overlay-modal" id='overlay-remove'>
      <div className="overlay-box">
        <h3>Are you sure you want to delete?</h3>
        <div className="modal-buttons">
          <div onClick={() => setModalShow(false)}
            className='btn btn-dark w-50'>
            Cancel
          </div>
          <div onClick={() => { deleteCollectionHandler() }}
            className='delete btn btn-danger w-50'>
            Delete
          </div>
        </div>
      </div>
    </div>}

    {loading ? (<div className="overlay"><OverlayLoading /></div>) : (
      <div className="row">
        <div className="col-md-12 text-center">
          {
            errorMessage ?
              (<div className="alert alert-danger myalert">
                {errorMessage}
              </div>) : ""
          }
        </div>
        <div>
          <button className='back' onClick={() => {
            params?.pageNumber ?
              navigate(`/collections/page/${params?.pageNumber}`)
              : navigate(`/collections`)
          }}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        </div>
        <div className="col-md-4">
          <div className="image">
            <img
              src={
                collection?.image ?
                  collection?.image?.includes('https://') ?
                    collection?.image :
                    `${imageEndPoint}${collection?.image}`
                  : "https://www.lcca.org.uk/media/574173/brand.jpg"
              }
              alt="Collection Image"
              className='category-image' />
          </div>
        </div>
        <div className="col-md-8">
          <div className="item-details">
            <div className="row">
              <div className="col-md-12">
                <div className="actions">
                  <button onClick={() => {
                    params?.pageNumber ?
                      navigate(`/collections/page/${params?.pageNumber}/${params?.id}/edit`)
                      : navigate(`/collections/${params?.id}/edit`)
                  }}
                    className='edit btn btn-warning'>
                    Edit
                  </button>
                  {
                    collection?.isArchived ? (
                      <button
                        className='edit btn btn-warning'
                        onClick={removeFromArchiveHandler}>
                        {archiveLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Remove from Archive"}
                      </button>
                    ) : (
                      <button
                        className='edit btn btn-warning'
                        onClick={addToArchiveHandler}>
                        {archiveLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Add to Archive"}
                      </button>
                    )
                  }
                  <button onClick={() => { setModalShow(true) }}
                    className='delete btn btn-danger'>
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <h2>{collection?.name}</h2>
            <p className='brand-click' onClick={() => { navigate(`/brands/${collection?.brandId?._id}`) }}><span>Collection Brand:</span> {collection?.brandId?.name}</p>
            <p><span>Collection Season:</span> {collection?.season}</p>
            <p><span>Collection Date:</span> {new Date(collection?.date).toDateString()}</p>
            <p><span>Collection Discount:</span> {collection?.discountRate}</p>
            <p><span>Collection Likes:</span> {collection?.numberOfLikes}</p>
            <p><span>Collection Reviews:</span> {collection?.numberOfReviews}</p>
            <p><span>Collection Rate:</span> {collection?.averageRate}</p>
            <p><span>Collection Categories:</span> {
              categories?.map((category) => {
                return category?.name + ", "
              })
            }</p>
            <p><span>Number of items:</span> {collection?.itemsList?.length}</p>
          </div>
        </div>

        <div className='pagination-nav'>
          <Pagination
            activePage={currentPage}
            itemsCountPerPage={1}
            totalItemsCount={totalResult}
            pageRangeDisplayed={10}
            onChange={handlePageChange}
            itemClass="page-item"
            linkClass="page-link"
          />
        </div>

        <div className='cat-items-style'><p>Brand Items</p></div>
        <div className="row">
          {
            collectionItems?.map((item) => {
              return (
                <div className="col-md-3" key={item?._id}>
                  <div className="item" onClick={() => navigate(`/items/${item?._id}`)}>
                    <div className="image">
                      <img src={item?.images?.[0]?.includes('https://') ?
                        item?.images?.[0] :
                        `${imageEndPoint}${item?.images?.[0]}`}
                        alt="Item Image" />
                    </div>
                    <div className="item-info">
                      <h3>{item?.name?.slice(0, 10)}</h3>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
    )}
  </>
}
