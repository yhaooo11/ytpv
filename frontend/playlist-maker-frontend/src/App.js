import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import queryService from './services/query'
import axios from 'axios'
import loadingGif from './Circles-menu-3.gif'
import './App.css';
const { v4: uuidv4 } = require('uuid')

const App = () => {

  const [search, setSearch] = useState('')

  // React state to track order of items
  const [songList, setSongList] = useState([]);

  const [bgImage, setBgImage] = useState(null)

  const [finalID, setFinalID] = useState('')

  const [loading, setLoading] = useState(false)

  // Function to update list on drop
  const handleDrop = (droppedItem) => {
    // Ignore drop outside droppable container
    if (!droppedItem.destination) return;
    var updatedList = [...songList];
    // Remove dragged item
    const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
    // Add dropped item
    updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
    // Update State
    setSongList(updatedList);
  };

  const handleItemChange = (event, index, newObject) => {
    event.preventDefault()
    console.log(index, newObject)
    // const newItem = event.target.value
    let updatedList = [...songList]
    updatedList[index] = newObject
    console.log(updatedList)
    setSongList(updatedList)
  }

  const handleAdd = (event) => {
    event.preventDefault()

    const regex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/

    if (!regex.test(search)) {
      alert('invalid link')
      return
    }

    queryService.getInfo({ query: search }).then(info => {
      console.log(info)
      const newList = songList.concat(info)
      setSongList(newList)
      setSearch('')
    })
    //alert(search)
  }

  const handleCreate = (event) => {
    event.preventDefault()
    if (songList.length === 0) {
      alert('add some songs!')
      return
    }
    console.log('created')
    const formData = new FormData()

    const fileID = uuidv4()

    if (!bgImage) {
      alert('add bg image')
      return
    }
    
    formData.append('file', bgImage)
    formData.append('filename', fileID)

    setLoading(true)

    axios
      .post("/uploader", formData)
      .then(res => console.log(res))
      .catch(err => console.warn(err));

    queryService.create({ queries: songList, bgFileName: fileID.concat(bgImage.name.split('.').pop())}).then(response => {
      console.log(response)
      setFinalID(response.path)
      setLoading(false)
    })
  }

  if (loading) {
    return (
      <div>
        <img src={loadingGif} alt="wait until the page loads" />
      </div>
    )
  }

  return (
    <div>
      <div className='home-header'>
        <h1><span className='sky-400'>yt</span>pv</h1>
        <h3>youtube playlist video maker</h3>
      </div>
      <div className='instructions'>
          <ol>
            <li>paste youtube link and press add</li>
            <li>edit song title and artist</li>
            <li>drag and drop to get order of songs</li>
            <li>choose video background image</li>
            <li>create and wait for download</li>
          </ol>
        </div>
      <div className='search-form'>
        <form onSubmit={handleAdd}>
          <input placeholder='Youtube Link' type='text' onChange={(event) => setSearch(event.target.value)} value={search}></input>
          <button type='submit'>Add</button>
        </form>
      </div>
      <div className='list'>
        <DragDropContext onDragEnd={handleDrop}>
        <Droppable droppableId="list-container">
          {(provided) => (
            <div
              className="list-container"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {songList.map((item, index) => (
                <Draggable key={item.title} draggableId={item.title} index={index}>
                  {(provided) => (
                    <div
                      className="item-container"
                      ref={provided.innerRef}
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}
                    >
                      {item.title} by {item.artist} 
                      <ListItem handleItemChange={handleItemChange} item={item} index={index}></ListItem>
                      {/* <input value={item} type='text' onChange={event => handleItemChange(event, index)}></input> */}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      </div>
      <form onSubmit={handleCreate}>
        <div>
        <input type='file' accept='image/*' onChange={(event) => setBgImage(event.target.files[0])}></input>
        </div>
        <button type='submit'>Create</button>
      </form>
      {/* https://medium.com/excited-developers/file-upload-with-react-flask-e115e6f2bf99 */}
       {/* <form action = "http://localhost:3000/" method = "POST" 
         enctype = "multipart/form-data">
         <input type = "file" name = "file" />
         <input type = "submit"/>
      </form>    */}
      {finalID && <a href={"http://localhost:5000/video/".concat(finalID)} target="blank"><button>Download video</button></a>}
      {/* {finalID && <a href={"video/".concat(finalID)} target="blank">Download (local)</a>} */}

    </div>
    
  )
}

const ListItem = ({ handleItemChange, item, index }) => {

  const [title, setTitle] = useState(item.title)
  const [artist, setArtist] = useState(item.artist)
  const [edit, setEdit] = useState(false)

  const handleTitleChange = (event) => {
    event.preventDefault()
    //handleItemChange(event, index)
    setTitle(event.target.value)
  }

  const handleArtistChange = (event) => {
    event.preventDefault()
    //handleItemChange(event, index)
    setArtist(event.target.value)
  }

  const handleEdit = (event) => {
    event.preventDefault()
    handleItemChange(event, index, { title, artist, id: item.id, link: item.link })
    setEdit(false)
  }

  if (edit) {
    return (
      <>
        <form onSubmit={handleEdit}>
          <input type='text' value={title} onChange={handleTitleChange}></input>
          <input type='text' value={artist} onChange={handleArtistChange}></input>
          <button type='submit'>Confirm</button>
        </form>
      </>
    )
  }

  return (
    <>
      <button onClick={() => setEdit(true)}>Edit</button>
    </>
  )
}

export default App;