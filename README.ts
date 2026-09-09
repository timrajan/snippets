 <div class="col-12 col-md-6 col-lg-3">
     <div class="py-1 form-floating mb-2">
         <input asp-for="RollNumber" inputmode="numeric" maxlength="11" title ="RollNumber must be exactly 11 digits" class="form-control border b-shadow-none" placeholder=" "/>
         <label asp-for="RollNumber">RollNumber</label>
         <span asp-validation-for="RollNumber" class="text-danger small"></span>
     </div>
 </div>
