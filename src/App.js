import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Amplify,{ Hub } from "@aws-amplify/core";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { Note } from "./models";
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import aws_exports from "./aws-exports"; // specify the location of aws-exports.js file on your project
Amplify.configure(aws_exports);

async function listNotes(setNotes) {
  const notes = await DataStore.query(Note, Predicates.ALL);
  setNotes(notes);
}

function App() {
  const [notes, setNotes] = useState([]);
  const [titleValue, setTitleValue] = useState("");
  const [contentValue, setContentValue] = useState("");
  const [id, setId] = useState("");
  const [displayAdd, setDisplayAdd] = useState(true);
  const [displayUpdate, setDisplayUpdate] = useState(false);
  const [displaySearch, setDisplaySearch] = useState(false);

  async function handleSubmit(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    await DataStore.save(
      new Note({
        title: titleValue,
        note: contentValue
      })
    );
    listNotes(setNotes);
    setTitleValue("");
    setContentValue("");
  };

  async function handleSearch(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    setDisplaySearch(true);
    const search = await DataStore.query(Note, c => 
      c.note("contains", contentValue).title("contains", titleValue)
    );
    setNotes(search);
    setTitleValue("");
    setContentValue("");
  }

  async function handleDelete(id) {
    const toDelete = await DataStore.query(Note, id);
    await DataStore.delete(toDelete);
  }

  async function handleSelect(note) {
    setContentValue(note.note);
    setTitleValue(note.title);
    setId(note.id);
    setDisplayUpdate(true);
    setDisplayAdd(false);
  }

  async function handleUpdate(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    const original = await DataStore.query(Note, id);
    await DataStore.save(
      Note.copyOf(original, updated => {
        updated.note = contentValue;
        updated.title = titleValue;
      })
    );
    listNotes(setNotes);
    setDisplayAdd(true);
    setDisplayUpdate(false);
    setTitleValue("");
    setContentValue("");
  }

  useEffect(() => {
    listNotes(setNotes);

    const listener = (data) => {
      if (data.payload.event === "signOut"){
        DataStore.clear();
      }
    }
    Hub.listen('auth', listener);

    const subscription = DataStore.observe(Note).subscribe(msg => {
      listNotes(setNotes);
    });

    const handleConnectionChange = () => {
      const condition = navigator.onLine ? "online" : "offline";
      console.log(condition);
      if (condition === "online") {
        listNotes(setNotes);
      }
    };

    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App">
      <header className="jumbotron jumbotron-fluid bg-dark">
        <img src={logo} className="App-logo" alt="logo" style={{ height: "150px" }}/>
      </header>
      <div className="container">
      <h3>React Notes App</h3>
      <br/>
        {displayAdd ? (
          <form>
            <div className="input-group input-group-lg mb-3">
              <input type="text" className="form-control form-control-lg" placeholder="Title" aria-label="Title" aria-describedby="basic-addon2" value={titleValue} onChange={e => setTitleValue(e.target.value)} />
              <input type="text" className="form-control form-control-lg" placeholder="Content" aria-label="Content" aria-describedby="basic-addon2" value={contentValue} onChange={e => setContentValue(e.target.value)} />
              <div className="input-group-append">
                <button className="btn btn-warning border border-light text-white font-weight-bold" type="button" onClick={e => { handleSubmit(e); }} >
                  Add Note
                </button>
                <button className="btn btn-warning border border-light text-white font-weight-bold" type="button" onClick={e => { handleSearch(e); }} >
                  Search
                </button>
              </div>
            </div>
          </form>
        ) : null}
        {displayUpdate ? (
          <form onSubmit={e => { handleUpdate(e); }} >
            <div className="input-group input-group-lg mb-3">
              <input type="text" className="form-control form-control-lg" placeholder="Update Title" aria-label="Title" aria-describedby="basic-addon2" value={titleValue} onChange={e => setTitleValue(e.target.value)} />
              <input type="text" className="form-control form-control-lg" placeholder="Update Content" aria-label="Content" aria-describedby="basic-addon2" value={contentValue} onChange={e => setContentValue(e.target.value)} />
              <div className="input-group-append">
                <button className="btn btn-warning text-white font-weight-bold" type="submit" >
                   Update Note
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </div>
      <div className="container">
        {notes.map((item, i) => {
          return (
            <div className="alert alert-warning alert-dismissible text-dark show" role="alert">
              <span key={item.i} onClick={() => handleSelect(item)}>
              <span class="lead"><span class="badge badge-warning text-light"><strong>{item.title}</strong></span></span> 
                <br/>
                {item.note}
              </span>
              <button key={item.i} type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => { handleDelete(item.id); listNotes(setNotes); }} >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          );
        })}
        {displaySearch ? (
          <button className="button btn-warning float-right text-white font-weight-bold" onClick={() => {setDisplaySearch(false); listNotes(setNotes); }}>
            <span aria-hidden="true">Clear Search</span>
          </button>
        ) : null}
      </div>
      <div class="fixed-bottom">
        <AmplifySignOut />
      </div>
    </div>
  );
}
export default withAuthenticator(App, { includeGreetings: true });