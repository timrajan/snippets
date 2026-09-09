 if (!ModelState.IsValid)
    {
        vm.Years = AppLists.Students.Years;
        vm.Genders = AppLists.Students.Genders;
        vm.Rows = Array.Empty<TestData>();
        vm.TotalCount = 0;
        return View(vm);
    }
