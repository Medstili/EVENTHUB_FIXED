<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::all();
        return $categories;
    }

    /**
     * Store a newly created resource in storage.
     */
    // public function store(Request $request)
    // {
    //     try{
    //         $request->validate([
    //             'name' => 'required|string|max:255',
    //             'description' => 'nullable|string|max:1000',
    //         ]);

    //         Category::create($request->all());
    //         return response()->json(['message'=>'category created successfully'], 201);

    //     }catch(\Exception $e){
    //         return response()->json(['message'=>'Error creating category'], 500);
    //     }
    // }

    /**
     * Display the specified resource.
     */
    // public function show(int $id)
    // {
    //     try {
    //         $category = Category::findOrFail($id);
    //         return response()->json(['category'=>$category], 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['message'=>'Category not found'], 404);
    //     }
        
    // }

    /**
     * Update the specified resource in storage.
     */
    // public function update(Request $request, Category $category)
    // {
    //     try {
    //         $request->validate([
    //             'name' => 'required|string|max:255',
    //             'description' => 'nullable|string|max:1000',
    //         ]);

    //         $category->update($request->all());
    //         return response()->json(['message'=>'Category updated successfully'], 200);

    //     } catch (\Exception $e) {
    //         return response()->json(['message'=>'Error updating category'], 500);
    //     }
    // }

    /**
     * Remove the specified resource from storage.
     */
    // public function destroy(int $id)
    // {
    //     try {
    //         $category = Category::findOrFail($id);
    //         $category->delete();
    //         return response()->json(['message'=>'Category deleted successfully'], 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['message'=>'Error deleting category'], 500);
    //     }
    // }
}
