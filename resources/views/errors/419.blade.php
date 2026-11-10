@extends('errors.layout')

@section('title', 'Page Expired')
@section('code', '419 SESSION EXPIRED')

@section('message', 'Your security token or session has expired due to inactivity. Please refresh the page and try again.')

@section('actions')
    <button onclick="window.location.reload()" class="btn">Refresh Page</button>
    <a href="/login" class="btn btn-outline">Back to Login</a>
@endsection
