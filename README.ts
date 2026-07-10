builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("ProductionConnection")));

builder.Services.AddDbContext<StagingDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("StagingConnection")));
