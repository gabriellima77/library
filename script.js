// ============= Global Variables ============= //

let myLibrary = [];
const regex = {title: /^[\d|\D]{1,50}$/, author: /^[a-zA-Z]\D{0,49}$/, pages: /^\d{1,5}$/};
const library = document.querySelector("#library");
const storage = Array.from(document.querySelector("#storage").children);
const menu = document.querySelector(".menu");
const info = document.querySelector("#info");
const form = document.querySelector("#form");
const inputs = Array.from(document.querySelectorAll("input"));
const add = document.querySelector("#add");
const yes = document.querySelector("#yes");
const no = document.querySelector("#no");


(function () {

        // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        var firebaseConfig = {
            apiKey: "AIzaSyC14WLA3qjuIyiKLxh-2SiToyGCzLPJh2c",
            authDomain: "library-f281c.firebaseapp.com",
            databaseURL: "https://library-f281c-default-rtdb.firebaseio.com",
            projectId: "library-f281c",
            storageBucket: "library-f281c.appspot.com",
            messagingSenderId: "679066470839",
            appId: "1:679066470839:web:2d4f671b06f6d5af2ac032",
            measurementId: "G-PML9V97SDQ"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
})()

// ============= Remote Storage ============= //

function updateLibrary(){
    const user = localStorage.getItem("user");
    if(user){
        firebase.database().ref(user).set(myLibrary);
    }
    else{
        createUser();
    }
}

function remoteLibrary(){
    const user = localStorage.getItem("user");
    if(user){
        let lib = firebase.database().ref(user);
        lib.once('value').then(snapshot => {
            const data = snapshot.val();
            if(data){
                data.forEach(book => {
                    const {title, author, pages, read} = book;
                    addBookToLibrary(title, author, pages, read);
                });
                showBooks(myLibrary);
            }  
        });
    }
    else{
        createUser();
        remoteLibrary();
    }
}

function createUser(){
    const numbers = [];
    const letters = [];
    let user = "";
    for(let i = 0; i < 10; i++){
        numbers.push(i);
    }
    for(let i = 65; i < 91; i++){
        letters.push(String.fromCharCode(i));
    }
    for(let i = 0; i < 6; i++){
        if(i % 2 == 0){
            user += letters[Math.floor(Math.random() * 26)];
        }
        else {
            user += numbers[Math.floor(Math.random() * 10)];
        }
    }
    if(!localStorage.getItem("user")){
        localStorage.setItem("user", user);
    }
}

// ============= Local Storage ============= //

storage.forEach(div => div.addEventListener("click", pickStorageType));
(localStorage.getItem("local") == "true")? pickStorageType(): undefined;
(localStorage.getItem("remote") == "true")? pickStorageType(): undefined;


function pickStorageType(){
    document.querySelector("#container").style.display = "none";
    document.querySelector("#menu").style.display = "flex";
    library.style.display = "grid";
    if(this.id == "local"){
        localStorage.setItem("local", "true");
    }
    else if(this.id == "remote"){
        localStorage.setItem("remote", "true");
        createUser();
    }
    if(localStorage.getItem("local")){
        storage.type = "local";
    }
    else if(localStorage.getItem("remote")){
        storage.type = "remote";
    }
}

function localLibrary(){
    const values = {title: "", author: "", pages: "", read: ""};
    for(let key in values){
        if(localStorage.getItem(key)){
            values[key] = localStorage.getItem(key);
            values[key] = values[key].substring(0, values[key].length - 1).split(",");
        }
    }
    for(let i = 0; i < values.title.length; i++){
        let book = [];
        for(let key in values){
            if(key == "read"){
                values[key][i] = (values[key][i] == "true")? true: false;
            }
            book.push(values[key][i]);
        }
        addBookToLibrary(book[0], book[1], book[2], book[3]);
    }
}

function setLocalStorage(){
    const values = {title: "", author: "", pages: "", read: ""};
    myLibrary.forEach(book => {
        for(key in book){
            if(key != "id"){
                values[key] += `${book[key]},`;
            }
        }
    });
    for(key in values){
        localStorage.setItem(key, values[key]);
    } 
}

function setStorage(){
    if(localStorage.local){
        localLibrary();
        showBooks(myLibrary);
    }
    else if(localStorage.remote){
        remoteLibrary();
    }
}

function validString() {
    const para = this.parentElement.firstElementChild;
    const type = {title:  "Title has min size 1 and max size is 50",
                  author: "first has to be a letter and max size is 50",
                  pages:  "Has to be a number and max size is 5"};
    if(!regex[this.id].test(this.value)){
        para.classList.add("active");
        para.textContent = type[this.id];
        this.placeholder = "";
    }
    else{
        para.classList.remove("active");
        this.placeholder = this.id;
    }
}

inputs.forEach(input => (input.type != "checkbox")? input.addEventListener("input", validString): undefined);

add.addEventListener("click", ()=> {
    inputs.forEach(input => (input.id == "read")? input.checked = false: input.value = "");
    form.style.display = "flex";
});

no.onclick = () => {
    form.style.display = "none";
    document.querySelectorAll("input").forEach(input => input.placeholder = input.id);
    const paraWarning = document.querySelectorAll(".warning");
    paraWarning.forEach(warning => warning.classList.remove("active"));
};

function getInfo(menu){
    const content = Array.from(menu.children);
    content.forEach(c => menu.removeChild(c));
    const para = [document.createElement("p"),
                  document.createElement("p"),
                  document.createElement("p"),
                  document.createElement("p")];
    const made = document.createElement("p");
    made.classList.add("made");
    made.textContent = "Made by Gabriel Lima";
    const quantity = myLibrary.reduce((number, book)=> {
        if(!book.read){
            number[0]++;
            number[2] += +book.pages;
        }
        else{
            number[1]++;
        }
        return number;
    }, [0, 0, 0]);
    const text = {"Books to read:": quantity[0], 
                  "Books already read:": quantity[1],
                  "Pages remaining:": quantity[2],
                  "Storage type:": storage.type
                 };
    let i = 0;
    for(let key in text){
        para[i].classList.add("text");
        para[i].textContent = `${key} ${text[key]}`;
        menu.appendChild(para[i]);
        i++;
    }
    menu.appendChild(made);
}

function addCard(){
    let countValidInput = 0;
    inputs.forEach(input => {
        let para = input.parentElement.firstElementChild;
        const type = {title:  "Title has min size 1 and max size is 50",
                      author: "first has to be a letter and max size is 50",
                      pages:  "Has to be a number and max size is 5"};
        if(input.type != "checkbox" && regex[input.id].test(input.value)){
            countValidInput++;
        }
        else if(input.type != "checkbox" && !regex[input.id].test(input.value)){
            input.placeholder = "";
            para.classList.add("active");
            para.textContent = type[input.id];
        }
    });
    if(countValidInput == inputs.length - 1){
        this.isValid = true;
        inputs.forEach(input => input.placeholder = input.id);
    }
    else{
        this.isValid = false;
    }
    if(this.isValid){
        console.log(1);
        const input = Array.from(document.querySelectorAll("input"));
        let array = []
        input.forEach(i => {
            if(i.type == "checkbox"){
                array.push(i.checked)
            }
            else{
                array.push(i.value);
            }
            i.value = "";
        });
        createBook(addBookToLibrary(array[0], array[1], array[2], array[3]));
        form.style.display = "none";
    }
    if(localStorage.local){
        setLocalStorage();
    }
    else if(localStorage.remote){
        updateLibrary();
    }
    getInfo(menu);
}

info.addEventListener("click", ()=> {
    const burger = Array.from(info.children);
    if(!info.isClicked){
        burger.forEach(div => div.classList.add("active"));
        menu.style.display = "flex";
        getInfo(menu);
        info.isClicked = true;
    }
    else{
        menu.style.display = "none";
        burger.forEach(div => div.classList.remove("active"));
        info.isClicked = false;
    }
})

yes.addEventListener("click", addCard);

function Book(title, author, pages, read){
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
}

function Card(book){
    this.card = document.createElement('div');
    this.book = book; 
}

Card.prototype.makeBar = function(){
    const bar = {class: "bar", span: {edit: "Edit", remove: "Remove"}};
    let element = document.createElement('div');
    for(let key in bar){
        if(key == "span"){
            for(let k in bar[key]){
                let span = document.createElement(key);
                span.classList.add(k);
                span.addEventListener("click", this[k]);
                span.textContent = bar[key][k];
                element.appendChild(span);
            }
        }
        else{
            element.classList.add(bar[key]);
        }
    }
    this.card.appendChild(element);
}

Card.prototype.putContent = function(){
    const content = document.createElement('div');
    content.classList.add('content');
    let {title, author} = this.book;
    let book = {title, author};
    for(let key in book){
        let para = document.createElement("p");
        para.classList.add(key)
        para.textContent = book[key];
        content.appendChild(para);
    }
    this.card.appendChild(content);
}

Card.prototype.footer = function(){
    const footer = document.createElement('div');
    footer.classList.add('footer');
    const p = [{class: "pages", textContent: `pages: ${this.book.pages}`}, {textContent: "Conclued"}];
    p.forEach(obj =>{
        let para = document.createElement("p");
        for(key in obj){
            if(key === "class"){
                para.classList.add(obj[key]);
            }
            else{
                para.textContent = obj[key];
            }
            footer.appendChild(para);
        }
    });
    const input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.classList.add("done");
    if(this.book.read){
        input.checked = this.book.read;
    }
    input.addEventListener("input", ()=>{
        this.book.read = input.checked;
        const index = myLibrary.indexOf(this.book);
        myLibrary[index].read = input.checked;
        if(localStorage.local){
            setLocalStorage();
        }
        else if(localStorage.remote){
            updateLibrary();
        }
        getInfo(menu);
    });
    footer.appendChild(input);
    this.card.appendChild(footer);
}

Card.prototype.makeCard = function() {
    if(yes.isEdit){
        const cards = Array.from(document.querySelectorAll(".card"));
        this.card = cards.filter(card => {
            if(card.dataset.index == yes.index){
                return card;
            }
        })[0];
        const content = Array.from(this.card.children);
        content.forEach(c => this.card.removeChild(c));
        const index = myLibrary.indexOf(this.book);
        myLibrary[index].id = index;
    }
    else{
        this.card.classList.add('card');
        const index = myLibrary.indexOf(this.book);
        this.card.setAttribute("data-index", index);
        myLibrary[index].id = index;
    }
    this.makeBar();
    this.putContent();
    this.footer();
}

Card.prototype.remove = function(){
    let cards = Array.from(document.querySelectorAll(".card"));
    const card = this.parentElement.parentElement;
    const index = parseInt(card.dataset.index);
    myLibrary = myLibrary.filter(book => {
        if(book.id !== index){
            return book;
        }
    });
    library.removeChild(card);
    cards = Array.from(document.querySelectorAll(".card"));
    cards.forEach(c => {
        let book = myLibrary.filter(book => {
            if(book.id == c.dataset.index){
                return book;
            }
        })[0];
        let index = myLibrary.indexOf(book);
        c.dataset.index = index;
        book.id = index;
    });
    if(localStorage.local){
        setLocalStorage();
    }
    else if(localStorage.remote){
        updateLibrary();
    }
    getInfo(menu);
}

Card.prototype.edit = function(){
    yes.isEdit = true;
    const card = this.parentElement.parentElement;
    yes.index = card.dataset.index;
    const book = myLibrary[yes.index];
    inputs.forEach(input => {
        if(input.id == "read"){
            input.checked = book[input.id]
        }
        else{
            input.value = book[input.id];
        }
    });
    form.style.display = "flex";
}

function addBookToLibrary(...args){
    const newBook = new Book(args[0], args[1], args[2], args[3]);
    if(yes.isEdit){
        const book = myLibrary.filter(book =>{
            if(book.id == yes.index){
                return book;
            }
       })[0];
       const index = myLibrary.indexOf(book)
       myLibrary[index] = newBook;
    }
    else{
        myLibrary.push(newBook);
    }
    if(localStorage.local){
        setLocalStorage();
    }
    return newBook;
}

function showBooks(myLibrary){
    myLibrary.forEach(book => {
        createBook(book);
    });
}

function createBook(book){
    const card = new Card(book);
    card.makeCard();
    if(!yes.isEdit){
        library.appendChild(card.card);
    }
    else{
        yes.isEdit = false;
    }
}

setStorage();