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
  private baseUrl = 'http://127.0.0.1:8000/api/';

    constructor(private http: HttpClient) {}
   

    getAll(params: any = {}): Observable<Category[]> {
       return this.http.get<[Category]>(this.apiUrl, {  withCredentials: true });
    }
   
    getById(id: number): Observable<Category> {
       return this.http.get<Category>(`${this.apiUrl}/${id}`, { withCredentials: true });
 
    }

      // getByCategory(id: number): Observable<Category[]> {
      //   const params = { categoryId: id.toString() };
      //   return this.http.get<Category[]>(`${this.baseUrl}/events`, { params, withCredentials: true });
      // }


}
