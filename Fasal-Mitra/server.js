// ...existing code...

// Handle undefined routes
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});