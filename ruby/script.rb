
class Tarea
  attr_accessor :descripcion, :completada

  def initialize(descripcion)
    @descripcion = descripcion
    @completada = false
  end

  def completar
    @completada = true
  end

  def to_s
    estado = completada ? "✔️" : "❌"
    "#{estado} #{@descripcion}"
  end
end

tareas = []
tareas << Tarea.new("Aprender Ruby")
tareas << Tarea.new("Leer un libro")
tareas << Tarea.new("Hacer ejercicio")

tareas[1].completar

tareas.each_with_index do |tarea, i|
  puts "#{i + 1}. #{tarea}"
end