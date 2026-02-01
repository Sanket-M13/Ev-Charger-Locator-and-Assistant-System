package com.evcharger.api.controller;

import com.evcharger.api.dto.BookingDto;
import com.evcharger.api.dto.StationDto;
import com.evcharger.api.security.UserDetailsImpl;
import com.evcharger.api.service.BookingService;
import com.evcharger.api.service.StationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/station-master")
@Tag(name = "Station Master", description = "Station Master management APIs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class StationMasterController {

    @Autowired
    private StationService stationService;

    @Autowired
    private BookingService bookingService;

    @GetMapping("/stations")
    @Operation(summary = "Get stations managed by station master")
    public ResponseEntity<?> getMyStations(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long stationMasterId = userDetails.getId();
            
            List<StationDto> stations = stationService.getStationsByMaster(stationMasterId);
            return ResponseEntity.ok(stations);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error retrieving stations", "error", e.getMessage()));
        }
    }

    @PostMapping("/stations")
    @Operation(summary = "Create new station")
    public ResponseEntity<?> createStation(@Valid @RequestBody StationDto stationDto, 
                                         Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long stationMasterId = userDetails.getId();
            
            StationDto createdStation = stationService.createStationForMaster(stationDto, stationMasterId);
            return ResponseEntity.ok(createdStation);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error creating station", "error", e.getMessage()));
        }
    }

    @PutMapping("/stations/{id}")
    @Operation(summary = "Update station")
    public ResponseEntity<?> updateStation(@PathVariable Long id, 
                                         @Valid @RequestBody StationDto stationDto,
                                         Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long stationMasterId = userDetails.getId();
            
            StationDto updatedStation = stationService.updateStationForMaster(id, stationDto, stationMasterId);
            return ResponseEntity.ok(updatedStation);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error updating station", "error", e.getMessage()));
        }
    }

    @PutMapping("/stations/{id}/status")
    @Operation(summary = "Update station status")
    public ResponseEntity<?> updateStationStatus(@PathVariable Long id, 
                                                @RequestBody Map<String, String> statusUpdate,
                                                Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long stationMasterId = userDetails.getId();
            
            String status = statusUpdate.get("status");
            stationService.updateStationStatus(id, status, stationMasterId);
            
            return ResponseEntity.ok(Map.of("message", "Station status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error updating station status", "error", e.getMessage()));
        }
    }

    @GetMapping("/stations/{id}/bookings")
    @Operation(summary = "Get bookings for station")
    public ResponseEntity<?> getStationBookings(@PathVariable Long id, 
                                               Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long stationMasterId = userDetails.getId();
            
            List<BookingDto> bookings = bookingService.getBookingsForStationMaster(id, stationMasterId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error retrieving bookings", "error", e.getMessage()));
        }
    }

    @PutMapping("/bookings/{id}/confirm")
    @Operation(summary = "Confirm booking")
    public ResponseEntity<?> confirmBooking(@PathVariable Long id) {
        try {
            bookingService.updateBookingStatus(id, "Confirmed");
            return ResponseEntity.ok(Map.of("message", "Booking confirmed successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error confirming booking", "error", e.getMessage()));
        }
    }

    @PutMapping("/bookings/{id}/cancel")
    @Operation(summary = "Cancel booking")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            bookingService.updateBookingStatus(id, "Cancelled");
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error cancelling booking", "error", e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("message", "Station Master API is working"));
    }

    @PutMapping("/bookings/{id}/complete")
    @Operation(summary = "Complete booking")
    public ResponseEntity<?> completeBooking(@PathVariable Long id) {
        try {
            bookingService.updateBookingStatus(id, "Completed");
            return ResponseEntity.ok(Map.of("message", "Booking completed successfully", "bookingId", id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage(), "error", e.getClass().getSimpleName()));
        }
    }
}