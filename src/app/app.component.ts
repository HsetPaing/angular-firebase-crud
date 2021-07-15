import { Component } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface books {
  name: string;
  price: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-firebase-crud';
  bookName = '';
  bookPrice = '';
  id='';
  summited = true;
  booksRef: AngularFirestoreCollection<books>;
  books: Observable<any[]>;

  constructor(firestore: AngularFirestore) {
    this.booksRef = firestore.collection<books>('books');
    this.books = this.booksRef.snapshotChanges().pipe(
      map((changes: any) => {
        return changes.map((action: any) => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          return {
            id,
            ...data,
          };
        });
      })
    );
    // this.books = firestore.collection('books').valueChanges();
  }

  addBook() {
    this.booksRef.add({
      name: this.bookName,
      price: parseInt(this.bookPrice),
    });
    this.bookName = '';
    this.bookPrice = '';
  }

  deleteBook(id: any) {
    //this.books
    this.booksRef.doc(id).delete();
    this.summited = true;
    this.bookName = '';
    this.bookPrice = '';
  }

  editBook(id: any) {
    console.log(this.books)
    this.books.subscribe(res =>{
      const bk = res.find(res => res.id === id);
      this.id = bk.id;
      this.bookName = bk.name;
      this.bookPrice = bk.price;
    })
    this.bookName = '';
    this.bookPrice = '';
    // this.booksRef
    //   .doc(id)
    //   .snapshotChanges()
    //   .subscribe((res) => {
    //     const book: any = res.payload.data();
    //     this.id = id;
    //     this.bookName = book.name;
    //     this.bookPrice = book.price;
    //   });
      this.summited = false;
  }

  updateBook() {
    this.booksRef.doc(this.id).update({
      name: this.bookName,
      price: parseInt(this.bookPrice),
    });
    this.summited = true;
    this.id = '';
    this.bookName = '';
    this.bookPrice = '';
  }
}
