import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Amplify from "@aws-amplify/core";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import { Note } from "./models";
import { withAuthenticator } from "aws-amplify-react";
import aws_exports from "./aws-exports"; // specify the location of aws-exports.js file on your project
Amplify.configure(aws_exports);

async function listNotes(setNotes) {
  const notes = await DataStore.query(Note, Predicates.ALL);
  setNotes(notes);
}

function App() {
  const [notes, setNotes] = useState([]);
  const [value, setValue] = useState("");
  const [id, setId] = useState("");
  const [displayAdd, setDisplayAdd] = useState(true);
  const [displayUpdate, setDisplayUpdate] = useState(false);
  const [displaySearch, setDisplaySearch] = useState(false);

  const handleSubmit = evt => {
    evt.preventDefault();
    evt.stopPropagation();
    DataStore.save(
      new Note({
        note: value
      })
    );
    listNotes(setNotes);
    setValue("");
  };

  async function handleSearch(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    setDisplaySearch(true);
    const search = await DataStore.query(Note, c => c.note("contains", value));
    setNotes(search);
    setValue("");
  }

  async function handleDelete(id) {
    const toDelete = await DataStore.query(Note, id);
    await DataStore.delete(toDelete);
  }

  async function handleSelect(note) {
    setValue(note.note);
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
        updated.note = value;
      })
    );
    listNotes(setNotes);
    setDisplayAdd(true);
    setDisplayUpdate(false);
    setValue("");
  }

  useEffect(() => {
    listNotes(setNotes);
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
      <header className="jumbotron">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className="container">
        {displayAdd ? (
          <form>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="New Note"
                aria-label="Note"
                aria-describedby="basic-addon2"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-warning border border-light"
                  type="button"
                  onClick={handleSubmit}
                >
                  Add Note
                </button>
                <button
                  className="btn btn-warning border border-light"
                  type="button"
                  onClick={e => {
                    handleSearch(e);
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        ) : null}
        {displayUpdate ? (
          <form
            onSubmit={e => {
              handleUpdate(e);
            }}
          >
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Update Note"
                aria-label="Note"
                aria-describedby="basic-addon2"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
              <div className="input-group-append">
                <button className="btn btn-primary" type="submit">
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
            <div
              className="alert alert-warning alert-dismissible show"
              role="alert"
            >
              <span key={item.i} onClick={() => handleSelect(item)}>
                {item.note}
              </span>
              <button
                key={item.i}
                type="button"
                className="close"
                data-dismiss="alert"
                aria-label="Close"
                onClick={() => {
                  handleDelete(item.id);
                  listNotes(setNotes);
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          );
        })}
        {displaySearch ? (
          <button
            className="button btn-warning float-right"
            onClick={() => {
              setDisplaySearch(false);
              listNotes(setNotes);
            }}
          >
            <span aria-hidden="true">Clear Search</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
