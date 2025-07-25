<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
                    'name'        => 'required|string|max:255',
                    'email'       => 'required|email|max:255',
                    'message'     => 'required|string|min:10',
                    'honeypot'    => 'empty',
                    'ip_address'  => 'nullable|string|max:45',
                    'user_agent'  => 'nullable|string',
                ];
    }

        protected function prepareForValidation()
    {
        $this->merge([
            'ip_address' => $this->ip(),
            'user_agent' => $this->header('User-Agent'),
        ]);
    }
}
