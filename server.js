const express = require("express");
const path = require("path");
const dataService = require("./data/data-service");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("home", { page: '' });
});

app.get("/about", (req, res) => {
    res.render("about", { page: '/about' });
});

/*app.get("/sites", async (req, res) => {
    try {
        let sites;
        if (req.query.region) {
            sites = await dataService.getSitesByRegion(req.query.region);
        } 
        else if (req.query.provinceOrTerritory) {
            sites = await dataService.getSitesBySubRegionName(req.query.provinceOrTerritory);
        } 
        else {
            sites = await dataService.getAllSites();
        }
        if (sites.length === 0) {
            throw new Error("No sites found.");
        }

        res.render("sites", { sites, page: '/sites' });
    } catch (error) {
        res.status(404).render("404", { message: "No sites found." });
    }
});*/
app.get("/sites", async (req, res) => {
    try {
        const { region, provinceOrTerritory } = req.query;
        let sites;

        // Filtering by region
        if (region) {
            sites = await dataService.getSitesByRegion(region);
        } 
        // Filtering by province/territory
        else if (provinceOrTerritory) {
            sites = await dataService.getSitesByProvinceOrTerritoryName(provinceOrTerritory);
        } 
        // Fetching all sites
        else {
            sites = await dataService.getAllSites();
        }

        if (sites.length === 0) {
            res.status(404).render("404", { message: "No sites found." });
        } else {
            res.render("sites", { sites, page: '/sites' });
        }
    } catch (error) {
        console.error("Error fetching sites:", error);
        res.status(500).render("error", { message: "Internal server error" });
    }
});



app.get("/sites/:siteId", async (req, res) => {
    try {
        const site = await dataService.getSiteById(req.params.siteId);
        if (!site) {
            res.status(404).render("404", { message: "Site not found." });
        } else {
            const provinceOrTerritory = await dataService.getProvinceOrTerritoryByName(site.provinceOrTerritoryCode);
            const regionName = provinceOrTerritory ? provinceOrTerritory.region : "Unknown";
            
            res.render("site", { site, provinceOrTerritory, regionName, page: '' });
        }
    } catch (error) {
        console.error("Error fetching site:", error);
        res.status(500).render("error", { message: "Internal server error" });
    }
});




app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found." });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

