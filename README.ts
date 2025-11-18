// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // Shows detailed error pages
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
