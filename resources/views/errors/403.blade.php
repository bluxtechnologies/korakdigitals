@extends('errors.layout')

@section('title', 'Access Denied')
@section('code', '403 FORBIDDEN')

@section('message', 'You do not have permission to access this resource or administrative workspace.')

@section('actions')
    <a href="/user/dashboard" class="btn">Return to Dashboard</a>
    <a href="/login" class="btn btn-outline">Sign In Again</a>
@endsection
