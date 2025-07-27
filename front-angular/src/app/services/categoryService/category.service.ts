import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable }     from 'rxjs';

export interface Category {
  id:number;
  name:string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://127.0.0.1:8000/api/guess/home/categories';

    constructor(private http: HttpClient) {}
   

    getAll(): Observable<Category[]> {
       return this.http.get<[Category]>(this.apiUrl, {  withCredentials: true });
    }
   
    getById(id: number): Observable<Category> {
       return this.http.get<Category>(`${this.apiUrl}/${id}`, { withCredentials: true });
 
    }

}
