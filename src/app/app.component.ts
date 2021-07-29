import { Component } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

interface books {
  name: string;
  price: number;
}

// 追加
interface account {
  email: string;
  password: string;
  passwordConfirmation: string;
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
  id = '';
  summited = true;
  booksRef: AngularFirestoreCollection<books>;
  books: Observable<any[]>;

  // 追加
  account: account = {
    email: '',
    password: '',
    passwordConfirmation: '',
  };

  constructor(firestore: AngularFirestore, public afAuth: AngularFireAuth) {
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
    console.log(this.books);
    this.books.subscribe((res) => {
      const bk = res.find((res) => res.id === id);
      this.id = bk.id;
      this.bookName = bk.name;
      this.bookPrice = bk.price;
    });
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

  submitSignUp(e: Event): void {
    e.preventDefault();
    // パスワード確認
    if (this.account.password !== this.account.passwordConfirmation) {
      alert('パスワードが異なります。');
      return;
    }

    this.afAuth
      .createUserWithEmailAndPassword(this.account.email, this.account.password) // アカウント作成
      .then((auth) => auth.user?.sendEmailVerification()) // メールアドレス確認
      .then(() => alert('メールアドレス確認メールを送信しました。'))
      .catch((err) => {
        console.log(err);
        alert('アカウントの作成に失敗しました。\n' + err);
      });

    this.account = { email: '', password: '', passwordConfirmation: '' };
  }

  login(account: account): void {
    this.afAuth
      .signInWithEmailAndPassword(account.email, account.password)
      .then((auth) => {
        // メールアドレス確認が済んでいるかどうか
        console.log(auth);
        if (!auth.user?.emailVerified) {
          this.afAuth.signOut();
          return Promise.reject('メールアドレスが確認できていません。');
        } else {
          return null;
        }
      })
      .then(() => alert('ログインしました。'))
      .catch((err) => {
        console.log(err);
        alert('ログインに失敗しました。\n' + err);
      });
  }
}
