import { analyzeNgModules } from '@angular/compiler';
import { Component, OnInit, TemplateRef } from '@angular/core';

import axios from 'axios';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-vista',
  templateUrl: './vista.component.html',
  styleUrls: ['./vista.component.scss'],
})
export class VistaComponent implements OnInit {
  //Se almacenaran las listas aquí
  listaProductos: [];
  listaCupones: [];

  //Alerts
  alerts: any[] = [];

  //Estan enlazados con los input del formulario
  idProducto: '';
  idCupon: '';

  //Mensaje para los modales
  mensaje: string;
  titulo: string;

  //Objeto para almacenar el cupon
  nuevoCupon: {};

  //Funciones para el modal
  modalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}

  mostrarModalNuevoProducto(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  ngOnInit(): void {
    this.peticiones();
    this.nuevoCupon = {
      name: '',
      description: '',
      product_id: '',
      valid_since: '',
      valid_until: '',
    };
  }

  /**
   * Al inicial el aplicativo trae la data de los productos y cupones existentes
   */
  async peticiones() {
    var aux;
    await axios
      .get('http://localhost:3000/productos', { headers: { auth: 'admin' } })
      .then(function (response) {
        aux = response.data;
      });
    this.listaProductos = aux;
    await axios
      .get('http://localhost:3000/cupones', { headers: { auth: 'admin' } })
      .then(function (response) {
        aux = response.data;
      });
    this.listaCupones = aux;
  }

  /**
   * Trae un procducto especifico
   */
  async buscarProducto(template: TemplateRef<any>) {
    if (this.idProducto != undefined || this.idProducto != null) {
      var aux, status;
      await axios
        .get('http://localhost:3000/productos/' + this.idProducto, {
          headers: { auth: 'admin' },
        })
        .then(function (response) {
          aux = response.data;
          status = response.status;
        })
        .catch(function (error) {
          status = error;
        });
      if (status == 200) {
        this.titulo = '<h4 class="modal-title pull-left">Producto</h4>';
        this.mensaje =
          '<h5>Id: ' + aux.id + '</h5><h5>Nombre: ' + aux.name + '</h5>';
        this.modalRef = this.modalService.show(template);
      } else {
        this.alerts.push({
          type: 'danger',
          msg: `¡UPS! Parece que no pudimos encontrar lo que estabas buscando.`,
          timeout: 5000,
        });
      }
    }
  }

  /**
   * Trae un cupon especifico
   */
  async buscarCupon(type, template: TemplateRef<any>) {
    if (this.idCupon != undefined || this.idCupon != null) {
      var aux, status;
      await axios
        .get('http://localhost:3000/cupones/' + this.idCupon, {
          headers: { auth: type },
        })
        .then(function (response) {
          aux = response.data;
          status = response.status;
        })
        .catch(function (error) {
          status = error;
        });
      if (status == 200) {
        this.titulo = '<h4 class="modal-title pull-left">Cupon</h4>';
        if (type == 'admin') {
          this.mensaje =
            '<h5>Id: ' +
            aux.id +
            '</h5><h5>Nombre: ' +
            aux.name +
            '</h5><h5>Descripcion: ' +
            aux.description +
            '</h5><h5>Id de producto: ' +
            aux.product_id +
            '</h5><h5>Valido desde: ' +
            aux.valid_since +
            '</h5><h5>Valido hasta: ' +
            aux.valid_until +
            '</h5>';
        } else {
          console.log(aux);
          this.mensaje =
            '<h5>Id: ' +
            aux.id +
            '</h5><h5>Nombre: ' +
            aux.name +
            '</h5><h5 class="' +
            (aux.isValid ? 'text-success' : 'text-danger') +
            '">' +
            (aux.isValid ? 'Es valido' : 'No es valido') +
            '</h5>';
        }
        this.modalRef = this.modalService.show(template);
      } else {
        this.alerts.push({
          type: 'danger',
          msg: `¡UPS! Parece que no pudimos encontrar lo que estabas buscando.`,
          timeout: 5000,
        });
      }
    }
  }

  /**
   * Agrega un nuevo cupon
   */
  async agregarCupon() {
    var aux, status;
    await axios
      .post('http://localhost:3000/cupones/crear', this.nuevoCupon, {
        headers: { auth: 'admin' },
      })
      .then(function (response) {
        aux = response.data;
        status = response.status;
      })
      .catch(function (error) {
        status = error;
      });

    this.modalRef.hide();

    if (status == 200) {
      this.peticiones();
      this.alerts.push({
        type: 'success',
        msg: `¡YEAH! Hemos creado tu cupon de manera correcta.`,
        timeout: 5000,
      });
    }
    else{
      this.alerts.push({
        type: 'danger',
        msg: `¡UPS! Has introducido un dato incorrecto.`,
        timeout: 5000,
      });
    }
  }
}
