document.getElementById('giveaway-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const form = e.target;
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }
  
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const contactInfo = document.getElementById('contactInfo').value;
  
    // Simulate form submission to forms.gov.sg
    const formData = {
      name: name,
      description: description,
      contactInfo: contactInfo
    };
  
    console.log('Form data submitted to forms.gov.sg:', formData);
  
    // Add the item to the items list
    const itemElement = document.createElement('li');
    itemElement.classList.add('list-group-item');
    itemElement.innerHTML = `
      <h5>${name}</h5>
      <p>${description}</p>
      <p>Contact Info: ${contactInfo}</p>
    `;
    document.getElementById('items-list').appendChild(itemElement);
  
    // Clear the form
    document.getElementById('giveaway-form').reset();
    form.classList.remove('was-validated');
  });
  