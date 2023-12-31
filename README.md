# loadlinker_backend
# Commercial Vehicles Booking Web Application

## Description

This is a web application built with the MERN stack that facilitates the booking of commercial vehicles for shippers and vehicle owners. It serves as a marketplace for matching available loads with suitable vehicles and includes user roles for Vehicle Owners, Shippers, and an Admin.

## Roles

- Vehicle Owner
- Shipper or Transporter
- Admin

## Features

### Vehicle Owner

#### Registration
- Create an account with username, email, phone number, and password.
- Choose the "Vehicle Owner" role during registration.
- Verify your account with Email OTP or Mobile Number OTP.

#### Log In
- Log in using your mobile number and password.
- Receive an OTP on successful login.
- Implement "Forget Password" functionality.

#### Marketplace
- Browse and filter available loads based on location and weight.
- Bid on loads in the marketplace.
- Update load status to "Loaded" and receive confirmation from the Shipper.
- Update live vehicle location every 2 hours.
- After unloading, update status to "Unloaded" and bid for another load in the marketplace.

#### Load Detail Page
- View detailed information about a load.
- Place bids on loads.

#### Dashboard
- Manage your profile and edit details.
- View current and previous load details for each vehicle.
- Track earnings with graphs and charts for different months and years.

#### Add Vehicle
- Add vehicles with details like registration number, RC number, permit type, permitted load capacity, and images.
- Admin approval is required for the vehicle based on the provided details.

### Shipper

#### Registration
- Create an account with username, email, phone number, and password.
- Choose the "Shipper" role during registration.
- Verify your account with Email OTP or Mobile Number OTP.

#### Profile
- Manage and edit your profile details.

#### Add Load
- Post load details, including type, weight, loading date, locations (with map selection), and options like perishable products and time duration.
- Calculate load amount based on vehicle type and distance.

#### Current Load
- Manage open loads in the marketplace.
- Edit load details and view current bids.
- Select a vehicle from the bids and handle payments.
- Update load status (Loaded/Unloaded) and receive updates from the vehicle.

#### Previous Load
- Add reviews for completed shipments.
- Report vehicle owners to the admin.

### Admin

#### Vehicle Approval
- Review vehicle details, including photos.
- Approve, reject, or set the status to pending with comments.

#### Dashboard
- Monitor present load posts, bid counts, and location-based load information.
- Track the number of loaded vehicles and their live locations.

#### Revenue
- View revenue details by vehicle, week, month, and year.



