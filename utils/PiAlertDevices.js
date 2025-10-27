const PIALERT_ALL_URL = "http://192.168.1.206:4000/all";

async function fetchOnlineDevices() {
    try {
        const response = await fetch(PIALERT_ALL_URL);
        const data = await response.json();

        if (!data || !data.devices) {
            console.error("Failed to fetch or parse /all data.");
            return null;
        }

        const onlineDevices = data.devices.map(rowStr => {
            const fields = rowStr.match(/'([^']*)'/g)?.map(field => field.replace(/'/g, '')) || [];
            if (fields.length < 6) return null;

            const presenceMatch = rowStr.match(/,\s*(\d+)\s*\)\s*$/);
            const isOnline = presenceMatch ? presenceMatch[1] === "1" : false;

            return isOnline ? {
                mac: fields[0].trim(),
                name: fields[1].trim(),
                owner: fields[2].trim(),
                type: fields[3].trim(),
                vendor: fields[4].trim(),
                ip: fields[5].trim(),
                online: isOnline
            } : null;
        }).filter(device => device !== null);

        return onlineDevices;
    } catch (error) {
        console.error("Error fetching online devices:", error);
        return null;
    }
}

// Fetch devices dynamically
export async function getOnlineDevices() {
    const devices = await fetchOnlineDevices();
    return devices ?? []; // Fallback to empty list if Pi.Alert is unreachable
}
