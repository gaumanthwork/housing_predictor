package com.haven.market.property;

import jakarta.persistence.*;

@Entity
@Table(name = "properties")
public class Property {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double squareFootage;
    private int bedrooms;
    private double bathrooms;
    private int yearBuilt;
    private double lotSize;
    private double distanceToCityCenter;
    private double schoolRating;
    private double price;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public double getSquareFootage() { return squareFootage; }
    public void setSquareFootage(double value) { squareFootage = value; }
    public int getBedrooms() { return bedrooms; }
    public void setBedrooms(int value) { bedrooms = value; }
    public double getBathrooms() { return bathrooms; }
    public void setBathrooms(double value) { bathrooms = value; }
    public int getYearBuilt() { return yearBuilt; }
    public void setYearBuilt(int value) { yearBuilt = value; }
    public double getLotSize() { return lotSize; }
    public void setLotSize(double value) { lotSize = value; }
    public double getDistanceToCityCenter() { return distanceToCityCenter; }
    public void setDistanceToCityCenter(double value) { distanceToCityCenter = value; }
    public double getSchoolRating() { return schoolRating; }
    public void setSchoolRating(double value) { schoolRating = value; }
    public double getPrice() { return price; }
    public void setPrice(double value) { price = value; }
}
