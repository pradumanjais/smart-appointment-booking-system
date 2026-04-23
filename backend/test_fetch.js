fetch('http://localhost:5000/api/providers')
  .then(res => res.json())
  .then(data => {
    // Print the first provider's full structure
    if (data.length > 0) {
      console.log('=== FIRST PROVIDER FULL STRUCTURE ===');
      console.log(JSON.stringify(data[0], null, 2));
      console.log('\n=== ALL PROVIDER KEYS ===');
      console.log(Object.keys(data[0]));
      console.log('\n=== consultationFees ===');
      console.log(data[0].consultationFees);
      console.log('\n=== userId ===');
      console.log(data[0].userId);
      console.log('\n=== Total providers:', data.length);
    } else {
      console.log('No providers returned');
    }
  })
  .catch(err => console.error(err.message));
