// utils/IsOnline.js

const PIALERT_ALL_URL = "http://192.168.1.206:4000/all";

// ⏱ Timeout wrapper for fetch
function fetchWithTimeout(url, timeout = 1500) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), timeout)
        )
    ]);
}

async function fetchDevices() {
    try {
        const response = await fetchWithTimeout(PIALERT_ALL_URL);
        const data = await response.json();

        if (!data || !data.devices) {
            console.error("Failed to fetch or parse /all data.");
            return null;
        }

        return data.devices.map(rowStr => {
            const fields = rowStr.match(/'([^']*)'/g)?.map(field => field.replace(/'/g, '')) || [];
            if (fields.length < 6) return null;

            const presenceMatch = rowStr.match(/,\s*(\d+)\s*\)\s*$/);
            const isOnline = presenceMatch ? presenceMatch[1] === "1" : false;

            return {
                mac: fields[0].trim(),
                name: fields[1].trim(),
                owner: fields[2].trim(),
                type: fields[3].trim(),
                vendor: fields[4].trim(),
                ip: fields[5].trim(),
                online: isOnline
            };
        }).filter(device => device !== null);
    } catch (error) {
        console.error("Error fetching devices:", error.message);
        return null;
    }
}

export async function getDeviceStatus(ipLastNumber) {
    const targetIp = `192.168.1.${ipLastNumber}`;
    try {
        const devices = await fetchDevices();

        if (!devices) {
            return { ip: targetIp, online: false };
        }

        const device = devices.find(d => d.ip === targetIp);
        return device ? { ip: targetIp, online: device.online } : { ip: targetIp, online: false };

    } catch (error) {
        console.error("Error fetching device status:", error.message);
        return { ip: targetIp, online: false };
    }
}
