import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import categoryServices from '../../../services/categoryServices';
import brandServices from '../../../services/brandServices';
import collectionServices from '../../../services/collectionServices';
import toastPopup from '../../../helpers/toastPopup';
import Multiselect from 'multiselect-react-dropdown';
import itemServices from '../../../services/itemServices';
import './AddCollection.scss'

export default function AddCollection() {

  const navigate = useNavigate()

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadImage, setUploadImage] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [brands, setBrands] = useState([])
  const [items, setItems] = useState([])
  const [brand, setBrand] = useState("")
  const [season, setSeason] = useState("")
  const [date, setDate] = useState("")

  const [newCollection, setNewCollection] = useState({
    name: "",
    discountRate: 0
  })

  function getNewCollectionData(e) {
    let newCollectionData = { ...newCollection }
    newCollectionData[e.target.name] = e.target.value
    setNewCollection(newCollectionData)
  }

  async function getAllCategoriesHandler() {
    setLoading(true)
    try {
      const { data } = await categoryServices.getAllCategories(1, 10000);
      setLoading(true)
      if (data?.success && data?.status === 200) {
        setLoading(false);
        setCategories(data?.Data)
      }
    } catch (e) {
      setLoading(false);
      setErrorMessage(e?.response?.data?.message);
    }
  }

  function toggleSelectedCategoriesHandler(categoryId) {
    if (selectedCategories.includes(categoryId)) {
      let oldSelectedCategories = selectedCategories
      let newSelectedCategories = oldSelectedCategories.filter((category) => { return category !== categoryId })
      setSelectedCategories(newSelectedCategories)
    } else {
      setSelectedCategories((prev) => { return [...prev, categoryId] })
    }
  }

  function getFinalCategories() {
    let finalBrandCategories = []
    selectedCategories.forEach((selectedCategory) => {
      categories.filter(category => category?._id === selectedCategory).map((category) => {
        finalBrandCategories.push(category?._id)
      })
    })

    return finalBrandCategories
  }

  let categoriesOptions = categories.map((category) => {
    return ({
      name: category?.name,
      id: category?._id
    })
  })

  async function getAllBrandsHandler() {
    setLoading(true)
    try {
      const { data } = await brandServices.getAllBrands(1, 5000);
      setLoading(true)
      if (data?.success && data?.status === 200) {
        setLoading(false);
        setBrands(data?.Data)
      }
    } catch (e) {
      setLoading(false);
      setErrorMessage(e?.response?.data?.message);
    }
  }

  async function getAllBrandItemsHandler(brand) {
    setLoading(true)
    try {
      const { data } = await itemServices.getBrandItems(brand, 1, 10000);
      setLoading(true)
      if (data?.success && data?.status === 200) {
        setLoading(false);
        setItems(data?.Data)
      }
    } catch (e) {
      setLoading(false);
      setErrorMessage(e?.response?.data?.message);
    }
  }

  function toggleSelectedItemsHandler(itemId) {
    if (selectedItems.includes(itemId)) {
      let oldSelectedItems = selectedItems
      let newSelectedItems = oldSelectedItems.filter((item) => { return item !== itemId })
      setSelectedItems(newSelectedItems)
    } else {
      setSelectedItems((prev) => { return [...prev, itemId] })
    }
  }

  function getFinalItems() {
    let finalBrandItems = []
    selectedItems.forEach((selectedItem) => {
      items.filter(item => item?._id === selectedItem).map((item) => {
        finalBrandItems.push(item?._id)
      })
    })

    return finalBrandItems
  }

  let itemsOptions = items.map((item) => {
    return ({
      name: item?.name,
      id: item?._id
    })
  })

  async function addCollectionHandler(e) {
    e.preventDefault();
    setLoading(true);

    try {
      let collectionData = {
        name: newCollection?.name,
        season: season,
        date: date,
        discountRate: newCollection?.discountRate,
        categoryList: getFinalCategories(),
        itemsList: getFinalItems(),
        brandId: brand,
      }

      const { data } = await collectionServices.addCollection(collectionData)
      if (data?.success) {
        setLoading(false);
        let collectionId = data?.Data?._id
        var formData = new FormData();
        formData.append("images", uploadImage);
        setLoading(true)
        try {
          const { data } = await collectionServices.uploadImageCollection(collectionId, formData)
          setLoading(true)
          if (data?.success && data?.status === 200) {
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
          setErrorMessage(error);
        }
        navigate("/collections");
        toastPopup.success("Collection added successfully")
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage(error?.response?.data?.message);
    }
  };

  const ref = useRef();
  const imageUploader = (e) => {
    ref.current.click();
  };

  useEffect(() => {
    getAllCategoriesHandler()
    getAllBrandsHandler()
  }, [])

  useEffect(() => {
    getAllBrandItemsHandler(brand)
  }, [brand])

  return <>
    <div>
      <button className='back-edit' onClick={() => { navigate(`/collections`) }}>
        <i className="fa-solid fa-arrow-left"></i>
      </button>
    </div>
    <div className="row">
      <div className="col-md-12">
        <div className="add-collection-page">
          <div className="add-collection-card">
            <h3>Add Collection</h3>
            {
              errorMessage ?
                (<div className="alert alert-danger myalert">
                  {errorMessage}
                </div>) : ""
            }
            <div className="main-image-label">
              {uploadImage && (
                <img
                  src={uploadImage ? URL.createObjectURL(uploadImage) : null}
                  alt="imag-viewer"
                  className="uploaded-img"
                  onClick={() => {
                    window.open(
                      uploadImage ? URL.createObjectURL(uploadImage) : null
                    );
                  }}
                />
              )}
              <input
                className="main-input-image"
                type="file"
                name="upload-img"
                ref={ref}
                onChange={(e) => {
                  setUploadImage(e.target.files[0]);
                }}
              />
              <label
                className="main-label-image"
                onClick={imageUploader}
                htmlFor="upload-img"
              >
                Add Collection Image
              </label>
            </div>

            <form onSubmit={addCollectionHandler}>
              <label htmlFor="name">Name</label>
              <input
                onChange={getNewCollectionData}
                className='form-control add-collection-input'
                type="text"
                name="name"
                id="name"
              />

              <label>Season</label>
              <select onChange={(e) => { setSeason(e.target.value) }}
                className='form-control add-collection-input'
                id="season"
                name="season"
                title='season'>
                <option value=''>-- Season --</option>
                <option value="winter">Winter</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
              </select>

              <label htmlFor="date">Date</label>
              <input
                onChange={(e) => { setDate(e.target.value); }}
                type="date"
                name="date"
                id="date"
                className='form-control add-collection-input'
              />

              <label htmlFor="name">Discount</label>
              <input
                onChange={getNewCollectionData}
                className='form-control add-collection-input'
                type="number"
                name="discountRate"
                id="discount"
              />

              <label>Select Brand</label>
              <select onChange={(e) => { setBrand(e.target.value) }}
                className='form-control add-collection-input'
                id="brand"
                name="brand"
                title='brand'>
                <option value=''>-- Brand --</option>
                {brands.map((brand) => {
                  return (
                    <option key={brand?._id} value={brand?._id}>{brand?.name}</option>
                  )
                })}
              </select>

              <p className='select-categories'>Categories</p>
              <Multiselect
                displayValue="name"
                onKeyPressFn={function noRefCheck() { }}
                onRemove={function noRefCheck(selectedList, selectedItem) {
                  toggleSelectedCategoriesHandler(selectedItem.id)
                }}
                onSearch={function noRefCheck() { }}
                onSelect={function noRefCheck(selectedList, selectedItem) {
                  toggleSelectedCategoriesHandler(selectedItem.id)
                }}
                options={categoriesOptions}
                showCheckbox
              />

              <p className='select-categories'>Items</p>
              <Multiselect
                displayValue="name"
                onKeyPressFn={function noRefCheck() { }}
                onRemove={function noRefCheck(selectedList, selectedItem) {
                  toggleSelectedItemsHandler(selectedItem.id)
                }}
                onSearch={function noRefCheck() { }}
                onSelect={function noRefCheck(selectedList, selectedItem) {
                  toggleSelectedItemsHandler(selectedItem.id)
                }}
                options={itemsOptions}
                showCheckbox
              />

              <button className='add-collection-button'>
                {loading ?
                  (<i className="fas fa-spinner fa-spin "></i>)
                  : "Add Collection"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </>
}
