@extends('errors.layout')

@section('title', 'Too Many Requests')
@section('code', '429 RATE LIMITED')

@section('message', 'You have performed too many requests in a short period. Please wait a moment before trying again.')

@section('actions')
    <button onclick="window.location.reload()" class="btn">Try Again</button>
    <a href="/user/dashboard" class="btn btn-outline">Back to Dashboard</a>
@endsection
