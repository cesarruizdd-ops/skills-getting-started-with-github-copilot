document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and current options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const title = document.createElement("h4");
        title.textContent = name;

        const descP = document.createElement("p");
        descP.textContent = details.description;

        const scheduleP = document.createElement("p");
        scheduleP.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const availabilityP = document.createElement("p");
        availabilityP.className = "availability";
        availabilityP.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        const participantsLabel = document.createElement("p");
        participantsLabel.innerHTML = `<strong>Participants:</strong>`;

        const participantsUl = document.createElement("ul");
        participantsUl.className = "participants-list";

        if (details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            const nameSpan = document.createElement("span");
            nameSpan.textContent = p;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.setAttribute("aria-label", `Remove ${p}`);
            deleteBtn.textContent = "✖";

            deleteBtn.addEventListener("click", async () => {
              if (!confirm(`Unregister ${p} from ${name}?`)) return;
              try {
                const res = await fetch(
                  `/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(p)}`,
                  { method: "DELETE" }
                );
                const r = await res.json();
                if (res.ok) {
                  // remove li and update availability
                  participantsUl.removeChild(li);
                  const currentParticipants = participantsUl.querySelectorAll("li").length;
                  const newSpots = details.max_participants - currentParticipants;
                  availabilityP.innerHTML = `<strong>Availability:</strong> ${newSpots} spots left`;
                  messageDiv.textContent = r.message || "Participant removed";
                  messageDiv.className = "message success";
                } else {
                  messageDiv.textContent = r.detail || "Failed to remove participant";
                  messageDiv.className = "message error";
                }
                messageDiv.classList.remove("hidden");
                setTimeout(() => messageDiv.classList.add("hidden"), 5000);
              } catch (err) {
                console.error("Error removing participant:", err);
                messageDiv.textContent = "Failed to remove participant. Please try again.";
                messageDiv.className = "message error";
                messageDiv.classList.remove("hidden");
              }
            });

            li.appendChild(nameSpan);
            li.appendChild(deleteBtn);
            participantsUl.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No participants yet.";
          participantsUl.appendChild(li);
        }

        activityCard.appendChild(title);
        activityCard.appendChild(descP);
        activityCard.appendChild(scheduleP);
        activityCard.appendChild(availabilityP);
        activityCard.appendChild(participantsLabel);
        activityCard.appendChild(participantsUl);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "message success";
        signupForm.reset();
        // Refresh activities list to reflect new participant
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
